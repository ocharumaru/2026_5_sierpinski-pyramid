// Three.js のビルトイン uniform (modelMatrix, viewMatrix, projectionMatrix) は
// ShaderMaterial が自動で注入する。
// 平面メッシュ(planeGeometry)に貼ることで、頂点のワールド座標 xy がそのまま
// 複素平面上の点 c に対応する。

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
uniform float uBailout;
uniform vec3 uInsideColor;
uniform vec3 uAccentColor;

// 反復回数の上限。ControlPanel の maxDepth と合わせる。
const int MAX_ITER_CONST = 360;

// 1サンプル分のマンデルブロ計算と色付け。
vec3 sampleColor(vec2 c) {
  vec2 z = vec2(0.0);
  float bailout2 = uBailout * uBailout;
  int maxIter = int(uMaxIterF);

  float iter = 0.0;
  bool escaped = false;
  float radius = 0.0;

  for (int i = 0; i < MAX_ITER_CONST; i++) {
    if (i >= maxIter) break;
    float x2 = z.x * z.x;
    float y2 = z.y * z.y;
    float r2 = x2 + y2;
    if (r2 > bailout2) {
      escaped = true;
      radius = sqrt(r2);
      break;
    }
    z = vec2(x2 - y2 + c.x, 2.0 * z.x * z.y + c.y);
    iter = float(i + 1);
  }

  if (!escaped) {
    return uInsideColor;
  }

  float smoothIter = iter + 1.0 - log2(max(1.0, log2(max(radius, 1.0001))));
  float t = clamp(smoothIter / uMaxIterF, 0.0, 1.0);
  float glow = pow(t, 0.58);
  float band = 0.5 + 0.5 * sin(18.0 * t + uBailout * 0.75);

  // インサイド色 → アクセント色 のグラデーションを、glow と band で変調。
  float intensity = clamp(glow * (0.55 + 0.45 * band), 0.0, 1.0);
  return mix(uInsideColor, uAccentColor, intensity);
}

void main() {
  // 1ピクセルあたりのワールド座標差分を取得 → 2×2 サブピクセル位置をオフセット。
  // dFdx/dFdy は分岐の外で評価する必要があるためここで取得する。
  vec2 dx = dFdx(vCoord);
  vec2 dy = dFdy(vCoord);

  vec3 c0 = sampleColor(vCoord - 0.25 * dx - 0.25 * dy);
  vec3 c1 = sampleColor(vCoord + 0.25 * dx - 0.25 * dy);
  vec3 c2 = sampleColor(vCoord - 0.25 * dx + 0.25 * dy);
  vec3 c3 = sampleColor(vCoord + 0.25 * dx + 0.25 * dy);

  vec3 col = (c0 + c1 + c2 + c3) * 0.25;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;
