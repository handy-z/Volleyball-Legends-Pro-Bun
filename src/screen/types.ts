export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface ImageData {
  width: number;
  height: number;
  buffer: Uint8Array;
}
