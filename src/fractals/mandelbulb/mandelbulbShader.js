// Three.js のビルトイン uniform `cameraPosition`、`modelMatrix`、`viewMatrix`、
// `projectionMatrix` は ShaderMaterial が自動で注入する。

export const vertexShader = /* glsl */ `
varying vec3 vWorldPos;
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const fragmentShader = /* glsl */ `
precision highp float;

varying vec3 vWorldPos;

uniform float uPower;
uniform float uBailout;
uniform float uMaxIterF;
uniform float uShadow;

float mandelbulbDE(vec3 p, int maxIter, float power, float bailout) {
  vec3 z = p;
  float dr = 1.0;
  float r = 0.0;

  for (int i = 0; i < 256; i++) {
    if (i >= maxIter) break;

    r = length(z);
    if (r > bailout) break;

    float theta = acos(clamp(z.z / max(r, 1e-8), -1.0, 1.0));
    float phi = atan(z.y, z.x);

    float zr = pow(r, power);
    dr = pow(r, power - 1.0) * power * dr + 1.0;

    float newTheta = theta * power;
    float newPhi = phi * power;

    z = zr * vec3(
      sin(newTheta) * cos(newPhi),
      sin(newTheta) * sin(newPhi),
      cos(newTheta)
    ) + p;
  }

  r = max(r, 1e-8);
  return 0.5 * log(r) * r / dr;
}

vec3 estimateNormal(vec3 p, int maxIter, float power, float bailout) {
  float e = 1e-3;
  float dx = mandelbulbDE(p + vec3(e, 0.0, 0.0), maxIter, power, bailout) -
             mandelbulbDE(p - vec3(e, 0.0, 0.0), maxIter, power, bailout);
  float dy = mandelbulbDE(p + vec3(0.0, e, 0.0), maxIter, power, bailout) -
             mandelbulbDE(p - vec3(0.0, e, 0.0), maxIter, power, bailout);
  float dz = mandelbulbDE(p + vec3(0.0, 0.0, e), maxIter, power, bailout) -
             mandelbulbDE(p - vec3(0.0, 0.0, e), maxIter, power, bailout);
  return normalize(vec3(dx, dy, dz));
}

bool raymarch(
  vec3 ro,
  vec3 rd,
  int maxIter,
  float power,
  float bailout,
  out vec3 hitPos,
  out float travel
) {
  float t = 0.0;
  float tMax = 50.0;
  float eps = 1e-3;

  for (int step = 0; step < 160; step++) {
    vec3 p = ro + rd * t;
    float d = mandelbulbDE(p, maxIter, power, bailout);
    if (d < eps) {
      hitPos = p;
      travel = t;
      return true;
    }
    t += d;
    if (t > tMax) break;
  }

  travel = t;
  return false;
}

// 影 OFF: 単色 (#cbd5e1) ベースに ambient + diffuse の最小限の陰影。
vec3 shadeFlat(vec3 n) {
  vec3 baseColor = vec3(0.796, 0.835, 0.882);
  vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
  float diff = clamp(dot(n, lightDir), 0.0, 1.0);
  return baseColor * (0.6 + 0.5 * diff);
}

// 影 ON: 法線ベースの多色 + diffuse + specular + 距離フォグ。
vec3 shadeLit(vec3 p, vec3 n, vec3 ro, float travel) {
  vec3 lightDir = normalize(vec3(0.6, 0.8, 0.2));
  float diff = clamp(dot(n, lightDir), 0.0, 1.0);

  vec3 v = normalize(ro - p);
  vec3 h = normalize(lightDir + v);
  float spec = pow(clamp(dot(n, h), 0.0, 1.0), 48.0);

  float fog = 1.0 - exp(-0.06 * travel);

  vec3 base = 0.45 + 0.55 * n;
  vec3 col = base * (0.18 + 1.1 * diff) + 0.6 * spec;
  return mix(col, vec3(0.02, 0.03, 0.05), fog);
}

void main() {
  // カメラ位置から、いまレンダしている囲みスフィア表面に向かう方向がそのまま視線。
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vWorldPos - cameraPosition);

  int maxIter = int(uMaxIterF);

  vec3 hitPos;
  float travel;
  vec3 col;

  if (raymarch(ro, rd, maxIter, uPower, uBailout, hitPos, travel)) {
    vec3 n = estimateNormal(hitPos, maxIter, uPower, uBailout);
    col = uShadow > 0.5
      ? shadeLit(hitPos, n, ro, travel)
      : shadeFlat(n);
  } else {
    // 背景は Canvas の CSS background (color.bgPage) に任せて他モデルと揃える。
    discard;
  }

  col = pow(col, vec3(1.0 / 2.2));
  gl_FragColor = vec4(col, 1.0);
}
`;
