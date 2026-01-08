import { gdi32, gdiplus, msimg32 } from "./ffi-loader";
import { ptr, type Pointer } from "bun:ffi";
import type { RGB } from "./types";

export const PS_SOLID = 0;
export const NULL_BRUSH = 5;

export function rgbToColorRef(color: RGB): number {
  return (color.r & 0xff) | ((color.g & 0xff) << 8) | ((color.b & 0xff) << 16);
}

export function createPen(
  style: number,
  width: number,
  color: RGB,
): Pointer | bigint {
  if (width < 0) {
    throw new Error("Pen width must be non-negative");
  }
  const colorRef = rgbToColorRef(color);
  return gdi32.symbols.CreatePen(style, width, colorRef);
}

export function deleteObject(handle: Pointer | bigint): boolean {
  if (!handle) return false;
  return gdi32.symbols.DeleteObject(handle as bigint);
}

export function selectObject(
  hdc: Pointer | bigint,
  hObject: Pointer | bigint,
): Pointer | bigint {
  return gdi32.symbols.SelectObject(hdc as bigint, hObject as bigint);
}

export function moveToEx(hdc: Pointer | bigint, x: number, y: number): boolean {
  return gdi32.symbols.MoveToEx(hdc as bigint, x, y, null);
}

export function lineTo(hdc: Pointer | bigint, x: number, y: number): boolean {
  return gdi32.symbols.LineTo(hdc as bigint, x, y);
}

export function drawRectangle(
  hdc: Pointer | bigint,
  left: number,
  top: number,
  right: number,
  bottom: number,
): boolean {
  return gdi32.symbols.Rectangle(hdc as bigint, left, top, right, bottom);
}

export function drawEllipse(
  hdc: Pointer | bigint,
  left: number,
  top: number,
  right: number,
  bottom: number,
): boolean {
  return gdi32.symbols.Ellipse(hdc as bigint, left, top, right, bottom);
}

export function getStockObject(index: number): Pointer | bigint {
  return gdi32.symbols.GetStockObject(index);
}

export function createSolidBrush(color: RGB): Pointer | bigint {
  const colorRef = rgbToColorRef(color);
  return gdi32.symbols.CreateSolidBrush(colorRef);
}

let gdiplusToken: bigint = 0n;
let gdiplusInitialized = false;

export function initGdiPlus(): boolean {
  if (gdiplusInitialized) return true;

  const tokenBuffer = new BigUint64Array(1);
  const startupInput = new Uint8Array(24);
  const inputView = new DataView(startupInput.buffer);
  inputView.setUint32(0, 1, true);

  const status = gdiplus.symbols.GdiplusStartup(
    ptr(tokenBuffer),
    ptr(startupInput),
    null,
  );

  if (status === 0) {
    gdiplusToken = tokenBuffer[0];
    gdiplusInitialized = true;
    return true;
  }
  return false;
}

export function shutdownGdiPlus(): void {
  if (gdiplusInitialized && gdiplusToken !== 0n) {
    gdiplus.symbols.GdiplusShutdown(gdiplusToken);
    gdiplusToken = 0n;
    gdiplusInitialized = false;
  }
}

export function loadImageFromFile(filePath: string): bigint | null {
  if (!initGdiPlus()) return null;

  const widePathBuffer = Buffer.from(filePath + "\x00", "utf16le");
  const imageHandleBuffer = new BigUint64Array(1);

  const status = gdiplus.symbols.GdipCreateBitmapFromFile(
    ptr(widePathBuffer),
    ptr(imageHandleBuffer),
  );

  if (status === 0) {
    return imageHandleBuffer[0];
  }
  return null;
}

export function getImageDimensions(
  imageHandle: bigint,
): { width: number; height: number } | null {
  const widthBuffer = new Uint32Array(1);
  const heightBuffer = new Uint32Array(1);

  const widthStatus = gdiplus.symbols.GdipGetImageWidth(
    imageHandle,
    ptr(widthBuffer),
  );
  const heightStatus = gdiplus.symbols.GdipGetImageHeight(
    imageHandle,
    ptr(heightBuffer),
  );

  if (widthStatus === 0 && heightStatus === 0) {
    return { width: widthBuffer[0], height: heightBuffer[0] };
  }
  return null;
}

export function createGraphicsFromHdc(hdc: Pointer | bigint): bigint | null {
  if (!initGdiPlus()) return null;

  const graphicsBuffer = new BigUint64Array(1);
  const status = gdiplus.symbols.GdipCreateFromHDC(
    hdc as bigint,
    ptr(graphicsBuffer),
  );

  if (status === 0) {
    return graphicsBuffer[0];
  }
  return null;
}

export function drawImageToGraphics(
  graphics: bigint,
  imageHandle: bigint,
  x: number,
  y: number,
  width: number,
  height: number,
): boolean {
  const status = gdiplus.symbols.GdipDrawImageRectI(
    graphics,
    imageHandle,
    x,
    y,
    width,
    height,
  );
  return status === 0;
}

export function disposeImage(imageHandle: bigint): void {
  gdiplus.symbols.GdipDisposeImage(imageHandle);
}

export function deleteGraphics(graphics: bigint): void {
  gdiplus.symbols.GdipDeleteGraphics(graphics);
}

export function alphaBlend(
  hdcDest: Pointer | bigint,
  xDest: number,
  yDest: number,
  widthDest: number,
  heightDest: number,
  hdcSrc: Pointer | bigint,
  xSrc: number,
  ySrc: number,
  widthSrc: number,
  heightSrc: number,
  alpha: number = 255,
): boolean {
  const blendFunc = (alpha << 16) | (1 << 8) | 0;
  return msimg32.symbols.AlphaBlend(
    hdcDest as bigint,
    xDest,
    yDest,
    widthDest,
    heightDest,
    hdcSrc as bigint,
    xSrc,
    ySrc,
    widthSrc,
    heightSrc,
    BigInt(blendFunc),
  );
}

export function drawAntiAliasedEllipse(
  hdc: Pointer | bigint,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
  penWidth: number,
): boolean {
  if (!initGdiPlus()) return false;

  const graphicsBuffer = new BigUint64Array(1);
  const graphicsStatus = gdiplus.symbols.GdipCreateFromHDC(
    hdc as bigint,
    ptr(graphicsBuffer),
  );
  if (graphicsStatus !== 0) return false;

  const graphics = graphicsBuffer[0];

  gdiplus.symbols.GdipSetSmoothingMode(graphics, 4);

  const penBuffer = new BigUint64Array(1);
  const penStatus = gdiplus.symbols.GdipCreatePen1(
    color,
    penWidth,
    0,
    ptr(penBuffer),
  );
  if (penStatus !== 0) {
    gdiplus.symbols.GdipDeleteGraphics(graphics);
    return false;
  }

  const pen = penBuffer[0];

  gdiplus.symbols.GdipDrawEllipse(graphics, pen, x, y, width, height);

  gdiplus.symbols.GdipDeletePen(pen);
  gdiplus.symbols.GdipDeleteGraphics(graphics);

  return true;
}
