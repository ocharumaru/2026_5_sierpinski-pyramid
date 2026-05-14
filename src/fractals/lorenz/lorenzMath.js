export const DEFAULT_LORENZ = {
  sigma: 10,
  rho: 28,
  beta: 8 / 3,
};

export const POINTS_PER_STEP = 1000;
export const MAX_STEPS = 120;
export const INTEGRATION_DT = 0.001;
export const TRAJECTORY_SCALE = 0.04;
export const TRAJECTORY_Z_OFFSET = -25;
export const INITIAL_POSITION = { x: 0.01, y: 0, z: 0 };

function lorenzRHS(p, params) {
  return {
    x: params.sigma * (p.y - p.x),
    y: p.x * (params.rho - p.z) - p.y,
    z: p.x * p.y - params.beta * p.z,
  };
}

export function rk4Step(p, params) {
  const dt = INTEGRATION_DT;
  const k1 = lorenzRHS(p, params);
  const k2 = lorenzRHS({
    x: p.x + (dt / 2) * k1.x,
    y: p.y + (dt / 2) * k1.y,
    z: p.z + (dt / 2) * k1.z,
  }, params);
  const k3 = lorenzRHS({
    x: p.x + (dt / 2) * k2.x,
    y: p.y + (dt / 2) * k2.y,
    z: p.z + (dt / 2) * k2.z,
  }, params);
  const k4 = lorenzRHS({
    x: p.x + dt * k3.x,
    y: p.y + dt * k3.y,
    z: p.z + dt * k3.z,
  }, params);

  return {
    x: p.x + (dt / 6) * (k1.x + 2 * k2.x + 2 * k3.x + k4.x),
    y: p.y + (dt / 6) * (k1.y + 2 * k2.y + 2 * k3.y + k4.y),
    z: p.z + (dt / 6) * (k1.z + 2 * k2.z + 2 * k3.z + k4.z),
  };
}

export function generateTrajectory(totalPoints, params) {
  const positions = new Float32Array(totalPoints * 3);
  let p = { ...INITIAL_POSITION };

  for (let i = 0; i < totalPoints; i++) {
    const index = i * 3;
    positions[index] = p.x * TRAJECTORY_SCALE;
    positions[index + 1] = (p.z + TRAJECTORY_Z_OFFSET) * TRAJECTORY_SCALE;
    positions[index + 2] = p.y * TRAJECTORY_SCALE;
    p = rk4Step(p, params);
  }

  return positions;
}

export const LORENZ_PRESETS = [
  { name: 'カオス（標準）', params: { sigma: 10, rho: 28, beta: 8 / 3 } },
  { name: '周期軌道', params: { sigma: 10, rho: 99.96, beta: 8 / 3 } },
  { name: '収束', params: { sigma: 10, rho: 15, beta: 8 / 3 } },
  { name: '対称破れ', params: { sigma: 10, rho: 160, beta: 8 / 3 } },
];
