export const INITIAL_NEWTON_VIEW = {
  centerX: 0,
  centerY: 0,
  width: 3.0,
};

export const DEFAULT_NEWTON = {
  polyMode: 0,
  aRe: 1.0,
  aIm: 0.0,
  tol: 0.001,
};

export const NEWTON_POLY_PRESETS = [
  { mode: 0, name: "z³ − 1", description: "3つの根。古典的な三つ巴フラクタル。" },
  { mode: 1, name: "z⁴ − 1", description: "4つの根。正方対称。" },
  { mode: 2, name: "z⁵ − 1", description: "5つの根。五角対称。" },
  { mode: 3, name: "z³ − 2z + 2", description: "Cayley のケース。3つの根 + 2-サイクル。" },
];
