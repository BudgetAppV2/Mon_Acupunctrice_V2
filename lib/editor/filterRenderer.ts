/**
 * WebGL Filter Renderer — applique brightness/contrast/saturation/sepia/grayscale
 * via un shader GLSL sur un canvas 2D.
 *
 * Raison d'être : ctx.filter sur CanvasRenderingContext2D n'est pas supporté
 * sur Safari iOS < 18. Ce renderer WebGL2 fonctionne sur tous les appareils.
 */

const VERT = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_image;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_sepia;
uniform float u_grayscale;
uniform float u_hueRotate; // radians

vec3 hueRotate(vec3 col, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  // Standard RGB hue-rotate matrix
  return clamp(mat3(
    0.299+0.701*c+0.168*s,  0.299-0.299*c-0.328*s,  0.299-0.300*c+1.250*s,
    0.587-0.587*c+0.330*s,  0.587+0.413*c+0.035*s,  0.587-0.588*c-1.050*s,
    0.114-0.114*c-0.497*s,  0.114-0.114*c+0.292*s,  0.114+0.886*c-0.203*s
  ) * col, 0.0, 1.0);
}

void main() {
  vec4 c = texture(u_image, v_uv);
  vec3 col = c.rgb;

  // Brightness
  col = clamp(col * u_brightness, 0.0, 1.0);

  // Contrast (scale around mid-grey 0.5)
  col = clamp((col - 0.5) * u_contrast + 0.5, 0.0, 1.0);

  // Saturation (lerp with luminance)
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = clamp(mix(vec3(lum), col, u_saturation), 0.0, 1.0);

  // Sepia (classic sepia matrix blended by u_sepia amount)
  if (u_sepia > 0.0) {
    vec3 sep = vec3(
      dot(col, vec3(0.393, 0.769, 0.189)),
      dot(col, vec3(0.349, 0.686, 0.168)),
      dot(col, vec3(0.272, 0.534, 0.131))
    );
    col = clamp(mix(col, sep, u_sepia), 0.0, 1.0);
  }

  // Hue-rotate (only when non-zero)
  if (abs(u_hueRotate) > 0.001) {
    col = hueRotate(col, u_hueRotate);
  }

  // Grayscale
  if (u_grayscale > 0.0) {
    float gray = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(gray), u_grayscale);
  }

  fragColor = vec4(col, c.a);
}`;

interface FilterState {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  canvas: HTMLCanvasElement;
  imageTex: WebGLTexture;
}

let fState: FilterState | null = null;

function initFilterWebGL(w: number, h: number): FilterState | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: false, preserveDrawingBuffer: true }) as WebGL2RenderingContext | null;
    if (!gl) return null;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    return { gl, program: prog, canvas, imageTex: gl.createTexture()! };
  } catch { return null; }
}

interface FilterParams {
  brightness: number;
  contrast: number;
  saturation: number;
  sepia: number;
  grayscale: number;
  hueRotate: number; // degrees
}

/** Parse une chaîne CSS filter en paramètres numériques */
export function parseCssFilter(css: string): FilterParams {
  const getVal = (name: string, def: number): number => {
    const m = css.match(new RegExp(String.raw`${name}\(([\d.]+)(%|deg)?\)`));
    if (!m) return def;
    const v = parseFloat(m[1]);
    return m[2] === '%' ? v / 100 : v;
  };
  return {
    brightness: getVal('brightness', 1),
    contrast:   getVal('contrast', 1),
    saturation: getVal('saturate', 1),
    sepia:      getVal('sepia', 0),
    grayscale:  getVal('grayscale', 0),
    hueRotate:  getVal('hue-rotate', 0),
  };
}

/**
 * Applique un filtre CSS sur le canvas 2D source via WebGL.
 * Retourne true si le rendu a réussi, false en fallback (WebGL indisponible).
 */
export function applyCanvasFilter(
  sourceCtx: CanvasRenderingContext2D,
  filterCss: string,
  w: number,
  h: number,
): boolean {
  if (!fState || fState.canvas.width !== w || fState.canvas.height !== h) {
    fState = initFilterWebGL(w, h);
  }
  if (!fState) return false;

  const params = parseCssFilter(filterCss);
  const { gl, program, canvas, imageTex } = fState;

  gl.viewport(0, 0, w, h);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, imageTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCtx.canvas);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

  gl.useProgram(program);
  const u = (name: string) => gl.getUniformLocation(program, name);
  gl.uniform1i(u('u_image'), 0);
  gl.uniform1f(u('u_brightness'), params.brightness);
  gl.uniform1f(u('u_contrast'), params.contrast);
  gl.uniform1f(u('u_saturation'), params.saturation);
  gl.uniform1f(u('u_sepia'), params.sepia);
  gl.uniform1f(u('u_grayscale'), params.grayscale);
  gl.uniform1f(u('u_hueRotate'), params.hueRotate * Math.PI / 180);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.finish();

  sourceCtx.drawImage(canvas, 0, 0);
  return true;
}
