/**
 * WebGL LUT Renderer — applique une LUT 3D sur un canvas frame.
 * Compatible Safari iOS (WebGL 2.0).
 * Fallback CSS si WebGL non disponible.
 */

import type { LutData } from './lutParser';

const VERT_SHADER = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG_SHADER = `#version 300 es
precision highp float;
precision highp sampler3D;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_image;
uniform sampler3D u_lut;
uniform float u_lutSize;
uniform float u_intensity;
void main() {
  vec4 color = texture(u_image, v_uv);
  // Lookup dans la LUT 3D — ajuster les coords pour centrer dans les texels
  float scale = (u_lutSize - 1.0) / u_lutSize;
  float offset = 0.5 / u_lutSize;
  vec3 lutCoord = color.rgb * scale + offset;
  vec3 graded = texture(u_lut, lutCoord).rgb;
  // Mix entre original et grade selon l'intensite
  fragColor = vec4(mix(color.rgb, graded, u_intensity), color.a);
}`;

interface LutState { gl: WebGL2RenderingContext; program: WebGLProgram; canvas: OffscreenCanvas | HTMLCanvasElement; imageTex: WebGLTexture; lutTex: WebGLTexture; currentLutId: string; }
let state: LutState | null = null;

function initWebGL(w: number, h: number): LutState | null {
  try {
    const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : document.createElement('canvas');
    if (!(canvas instanceof OffscreenCanvas)) { canvas.width = w; canvas.height = h; }
    const gl = (canvas as HTMLCanvasElement).getContext('webgl2', { premultipliedAlpha: false }) as WebGL2RenderingContext | null;
    if (!gl) return null;
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SHADER), fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SHADER);
    if (!vs || !fs) return null;
    const prog = gl.createProgram()!; gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    const buf = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    return { gl, program: prog, canvas, imageTex: gl.createTexture()!, lutTex: gl.createTexture()!, currentLutId: '' };
  } catch { return null; }
}

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }

/** Upload la LUT comme texture 3D WebGL */
function uploadLut(st: LutState, lut: LutData, lutId: string) {
  if (st.currentLutId === lutId) return;
  const { gl, lutTex } = st;
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_3D, lutTex);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGB32F, lut.size, lut.size, lut.size, 0, gl.RGB, gl.FLOAT, lut.data);
  st.currentLutId = lutId;
}

/**
 * Applique une LUT sur le canvas 2D source.
 * Modifie les pixels du canvas in-place.
 */
export function applyLut(
  sourceCtx: CanvasRenderingContext2D,
  lut: LutData,
  lutId: string,
  w: number,
  h: number,
  intensity = 1.0,
): boolean {
  // Init ou resize WebGL
  if (!state || state.canvas.width !== w || state.canvas.height !== h) {
    state = initWebGL(w, h);
  }
  if (!state) return false; // WebGL non disponible

  const { gl, program, canvas, imageTex } = state;
  if (canvas instanceof HTMLCanvasElement) { canvas.width = w; canvas.height = h; }
  gl.viewport(0, 0, w, h);

  // Upload l'image source
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, imageTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCtx.canvas);

  // Upload la LUT
  uploadLut(state, lut, lutId);

  // Render
  gl.useProgram(program);
  gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);
  gl.uniform1i(gl.getUniformLocation(program, 'u_lut'), 1);
  gl.uniform1f(gl.getUniformLocation(program, 'u_lutSize'), lut.size);
  gl.uniform1f(gl.getUniformLocation(program, 'u_intensity'), intensity);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Copier le resultat sur le canvas 2D source
  sourceCtx.drawImage(canvas as HTMLCanvasElement, 0, 0);
  return true;
}

/** Cleanup WebGL resources */
export function destroyLutRenderer() {
  if (!state) return;
  const { gl, program, imageTex, lutTex } = state;
  gl.deleteTexture(imageTex); gl.deleteTexture(lutTex);
  gl.deleteProgram(program);
  state = null;
}
