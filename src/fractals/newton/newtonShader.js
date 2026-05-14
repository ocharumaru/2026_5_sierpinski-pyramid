export const vertexShader = /* glsl */ `
varying vec2 vCoord;
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vCoord = worldPos.xy;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const fragmentShader = /* glsl */ `
precision highp float;

varying vec2 vCoord;

uniform float uMaxIterF;
uniform int   uPolyMode;
uniform vec2  uA;
uniform float uTol;
uniform vec3  uInsideColor;
uniform vec3  uRootColors[5];
uniform int   uRootCount;

const int MAX_ITER_CONST = 80;
const int MAX_ROOTS = 5;

vec2 cmul(vec2 a, vec2 b) {
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}
vec2 cdiv(vec2 a, vec2 b) {
  float denom = b.x*b.x + b.y*b.y + 1e-30;
  return vec2(a.x*b.x + a.y*b.y, a.y*b.x - a.x*b.y) / denom;
}
vec2 csquare(vec2 z) { return cmul(z, z); }
vec2 ccube(vec2 z)   { return cmul(csquare(z), z); }
vec2 cpow4(vec2 z)   { return csquare(csquare(z)); }
vec2 cpow5(vec2 z)   { return cmul(cpow4(z), z); }

void polyAndRoots(vec2 z, out vec2 p, out vec2 dp, out vec2 roots[MAX_ROOTS], out int rootCount) {
  if (uPolyMode == 0) {
    p  = ccube(z) - vec2(1.0, 0.0);
    dp = 3.0 * csquare(z);
    roots[0] = vec2( 1.0,        0.0);
    roots[1] = vec2(-0.5,  0.8660254);
    roots[2] = vec2(-0.5, -0.8660254);
    roots[3] = vec2(0.0); roots[4] = vec2(0.0);
    rootCount = 3;
  } else if (uPolyMode == 1) {
    p  = cpow4(z) - vec2(1.0, 0.0);
    dp = 4.0 * ccube(z);
    roots[0] = vec2( 1.0,  0.0);
    roots[1] = vec2( 0.0,  1.0);
    roots[2] = vec2(-1.0,  0.0);
    roots[3] = vec2( 0.0, -1.0);
    roots[4] = vec2(0.0);
    rootCount = 4;
  } else if (uPolyMode == 2) {
    p  = cpow5(z) - vec2(1.0, 0.0);
    dp = 5.0 * cpow4(z);
    for (int k = 0; k < 5; k++) {
      float ang = 6.28318530718 * float(k) / 5.0;
      roots[k] = vec2(cos(ang), sin(ang));
    }
    rootCount = 5;
  } else {
    p  = ccube(z) - 2.0 * z + vec2(2.0, 0.0);
    dp = 3.0 * csquare(z) - vec2(2.0, 0.0);
    roots[0] = vec2(-1.76929235, 0.0);
    roots[1] = vec2( 0.88464618,  0.58974281);
    roots[2] = vec2( 0.88464618, -0.58974281);
    roots[3] = vec2(0.0); roots[4] = vec2(0.0);
    rootCount = 3;
  }
}

vec3 sampleColor(vec2 z0) {
  vec2 z = z0;
  int hitRoot = -1;
  float iter = uMaxIterF;
  float tol2 = uTol * uTol;
  int maxIter = int(uMaxIterF);

  for (int i = 0; i < MAX_ITER_CONST; i++) {
    if (i >= maxIter) break;
    vec2 p, dp;
    vec2 roots[MAX_ROOTS];
    int rootCount;
    polyAndRoots(z, p, dp, roots, rootCount);
    rootCount = min(rootCount, uRootCount);

    z = z - cmul(uA, cdiv(p, dp));

    for (int k = 0; k < MAX_ROOTS; k++) {
      if (k >= rootCount) break;
      vec2 d = z - roots[k];
      if (dot(d, d) < tol2) {
        hitRoot = k;
        iter = float(i);
        break;
      }
    }
    if (hitRoot >= 0) break;
  }

  if (hitRoot < 0) return uInsideColor;

  vec3 base = uInsideColor;
  for (int k = 0; k < MAX_ROOTS; k++) {
    if (k == hitRoot) { base = uRootColors[k]; break; }
  }
  float t = clamp(1.0 - iter / uMaxIterF, 0.0, 1.0);
  float intensity = pow(t, 0.6);
  return mix(uInsideColor, base, 0.25 + 0.75 * intensity);
}

void main() {
  vec2 dx = dFdx(vCoord);
  vec2 dy = dFdy(vCoord);

  vec3 c0 = sampleColor(vCoord - 0.25 * dx - 0.25 * dy);
  vec3 c1 = sampleColor(vCoord + 0.25 * dx - 0.25 * dy);
  vec3 c2 = sampleColor(vCoord - 0.25 * dx + 0.25 * dy);
  vec3 c3 = sampleColor(vCoord + 0.25 * dx + 0.25 * dy);

  gl_FragColor = vec4((c0 + c1 + c2 + c3) * 0.25, 1.0);
  #include <colorspace_fragment>
}
`;
