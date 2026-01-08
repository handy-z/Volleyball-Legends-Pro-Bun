export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface PenOptions {
  color: RGB;
  width: number;
}

export interface OverlayOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export const enum PenStyle {
  PS_SOLID = 0,
  PS_DASH = 1,
  PS_DOT = 2,
  PS_DASHDOT = 3,
  PS_DASHDOTDOT = 4,
  PS_NULL = 5,
}
