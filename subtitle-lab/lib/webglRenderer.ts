/**
 * WebGL video renderer with GPU-accelerated filters.
 * Works on Safari iOS (where ctx.filter is not supported).
 */

const VERT_SRC = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}`;

const FRAG_SRC = `
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_sepia;
uniform float u_grayscale;
uniform float u_hueRotate;

void main() {
  vec4 texel = texture2D(u_image, v_texCoord);
  vec3 color = texel.rgb;

  // Brightness
  color += u_brightness;

  // Contrast
  color = 0.5 + (1.0 + u_contrast) * (color - 0.5);

  // Saturation
  vec3 lum = vec3(0.2126, 0.7152, 0.0722);
  vec3 gray = vec3(dot(color, lum));
  color = mix(gray, color, 1.0 + u_saturation);

  // Grayscale
  if (u_grayscale > 0.0) {
    vec3 g = vec3(dot(color, lum));
    color = mix(color, g, u_grayscale);
  }

  // Sepia
  if (u_sepia > 0.0) {
    vec3 sep = vec3(
      dot(color, vec3(0.393, 0.769, 0.189)),
      dot(color, vec3(0.349, 0.686, 0.168)),
      dot(color, vec3(0.272, 0.534, 0.131))
    );
    color = mix(color, sep, u_sepia);
  }

  // Hue rotation
  if (abs(u_hueRotate) > 0.1) {
    float a = u_hueRotate * 3.14159265 / 180.0;
    float c = cos(a);
    float s = sin(a);
    mat3 hm = mat3(
      0.213 + c*0.787 - s*0.213, 0.213 - c*0.213 + s*0.143, 0.213 - c*0.213 - s*0.787,
      0.715 - c*0.715 - s*0.715, 0.715 + c*0.285 + s*0.140, 0.715 - c*0.715 + s*0.715,
      0.072 - c*0.072 + s*0.928, 0.072 - c*0.072 - s*0.283, 0.072 + c*0.928 + s*0.072
    );
    color = hm * color;
  }

  color = clamp(color, 0.0, 1.0);
  gl_FragColor = vec4(color, texel.a);
}`;

export interface FilterUniforms {
  brightness: number;
  contrast: number;
  saturation: number;
  sepia: number;
  grayscale: number;
  hueRotate: number;
}

export const IDENTITY_UNIFORMS: FilterUniforms = {
  brightness: 0, contrast: 0, saturation: 0, sepia: 0, grayscale: 0, hueRotate: 0,
};

/** Parse CSS filter string into WebGL uniforms with intensity applied */
export function cssFilterToUniforms(css: string, intensity: number): FilterUniforms {
  if (!css || css === 'none' || intensity <= 0) return IDENTITY_UNIFORMS;

  const u = { ...IDENTITY_UNIFORMS };
  const re = /(brightness|contrast|saturate|sepia|grayscale)\(([\d.]+)\)/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const fn = m[1], val = parseFloat(m[2]);
    switch (fn) {
      case 'brightness': u.brightness = (val - 1) * intensity; break;
      case 'contrast': u.contrast = (val - 1) * intensity; break;
      case 'saturate': u.saturation = (val - 1) * intensity; break;
      case 'sepia': u.sepia = val * intensity; break;
      case 'grayscale': u.grayscale = val * intensity; break;
    }
  }
  const hue = /hue-rotate\(([\d.]+)deg\)/.exec(css);
  if (hue) u.hueRotate = parseFloat(hue[1]) * intensity;

  return u;
}

// --- WebGL state ---

interface GLState {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  texture: WebGLTexture;
  posBuffer: WebGLBuffer;
  texBuffer: WebGLBuffer;
  locs: {
    a_position: number;
    a_texCoord: number;
    u_image: WebGLUniformLocation;
    u_brightness: WebGLUniformLocation;
    u_contrast: WebGLUniformLocation;
    u_saturation: WebGLUniformLocation;
    u_sepia: WebGLUniformLocation;
    u_grayscale: WebGLUniformLocation;
    u_hueRotate: WebGLUniformLocation;
  };
}

let state: GLState | null = null;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
  return s;
}

/** Initialize WebGL on a canvas. Call once. */
export function initWebGL(canvas: HTMLCanvasElement): boolean {
  if (state) return true;
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true });
  if (!gl) return false;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vs || !fs) return false;

  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;

  // Fullscreen quad
  const posBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  // Texture coords (will be updated per-frame for coverCrop)
  const texBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,1, 1,1, 0,0, 1,0]), gl.DYNAMIC_DRAW);

  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const locs = {
    a_position: gl.getAttribLocation(program, 'a_position'),
    a_texCoord: gl.getAttribLocation(program, 'a_texCoord'),
    u_image: gl.getUniformLocation(program, 'u_image')!,
    u_brightness: gl.getUniformLocation(program, 'u_brightness')!,
    u_contrast: gl.getUniformLocation(program, 'u_contrast')!,
    u_saturation: gl.getUniformLocation(program, 'u_saturation')!,
    u_sepia: gl.getUniformLocation(program, 'u_sepia')!,
    u_grayscale: gl.getUniformLocation(program, 'u_grayscale')!,
    u_hueRotate: gl.getUniformLocation(program, 'u_hueRotate')!,
  };

  state = { gl, program, texture, posBuffer, texBuffer, locs };
  return true;
}

/** Render a video frame with filter uniforms. CoverCrop via UV coords. */
export function renderVideoFrame(
  video: HTMLVideoElement,
  canvasW: number,
  canvasH: number,
  uniforms: FilterUniforms,
) {
  if (!state) return;
  const { gl, program, texture, posBuffer, texBuffer, locs } = state;

  gl.viewport(0, 0, canvasW, canvasH);
  gl.useProgram(program);

  // Upload video frame as texture
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

  // CoverCrop via UV coordinates
  const vw = video.videoWidth, vh = video.videoHeight;
  const vAspect = vw / vh, cAspect = canvasW / canvasH;
  let uL = 0, uR = 1, vT = 0, vB = 1;
  if (vAspect > cAspect) {
    const cropW = vh * cAspect;
    const offset = (vw - cropW) / (2 * vw);
    uL = offset; uR = 1 - offset;
  } else {
    const cropH = vw / cAspect;
    const offset = (vh - cropH) / (2 * vh);
    vT = offset; vB = 1 - offset;
  }

  // Update texture coords for crop (flip Y for WebGL)
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    uL, vB, uR, vB, uL, vT, uR, vT,
  ]), gl.DYNAMIC_DRAW);

  // Bind position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.enableVertexAttribArray(locs.a_position);
  gl.vertexAttribPointer(locs.a_position, 2, gl.FLOAT, false, 0, 0);

  // Bind texcoord buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
  gl.enableVertexAttribArray(locs.a_texCoord);
  gl.vertexAttribPointer(locs.a_texCoord, 2, gl.FLOAT, false, 0, 0);

  // Set uniforms
  gl.uniform1i(locs.u_image, 0);
  gl.uniform1f(locs.u_brightness, uniforms.brightness);
  gl.uniform1f(locs.u_contrast, uniforms.contrast);
  gl.uniform1f(locs.u_saturation, uniforms.saturation);
  gl.uniform1f(locs.u_sepia, uniforms.sepia);
  gl.uniform1f(locs.u_grayscale, uniforms.grayscale);
  gl.uniform1f(locs.u_hueRotate, uniforms.hueRotate);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

/** Cleanup WebGL resources */
export function destroyWebGL() {
  if (!state) return;
  const { gl, program, texture, posBuffer, texBuffer } = state;
  gl.deleteTexture(texture);
  gl.deleteBuffer(posBuffer);
  gl.deleteBuffer(texBuffer);
  gl.deleteProgram(program);
  state = null;
}
