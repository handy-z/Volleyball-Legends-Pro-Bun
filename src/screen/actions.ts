import { user32, gdi32 } from "./ffi-loader";
import { ptr, type Pointer } from "bun:ffi";
import type { ImageData } from "./types";

let reuseScreenDC: Pointer | bigint | null = null;
let reuseMemDC: Pointer | bigint | null = null;
let reuseBitmap: Pointer | bigint | null = null;
let reuseOldBitmap: Pointer | bigint | null = null;
let reuseBuffer: Uint8Array | null = null;
let reuseBitmapInfo: Uint8Array | null = null;
let reuseW = 0;
let reuseH = 0;

export function captureReuse(
  x: number,
  y: number,
  width: number,
  height: number,
): ImageData | null {
  if (width !== reuseW || height !== reuseH) {
    cleanupReuseResources();

    reuseScreenDC = user32.symbols.GetDC(null);
    if (!reuseScreenDC) return null;

    reuseMemDC = gdi32.symbols.CreateCompatibleDC(reuseScreenDC as bigint);
    if (!reuseMemDC) {
      user32.symbols.ReleaseDC(0n, reuseScreenDC as bigint);
      reuseScreenDC = null;
      return null;
    }

    reuseBitmap = gdi32.symbols.CreateCompatibleBitmap(
      reuseScreenDC as bigint,
      width,
      height,
    );
    if (!reuseBitmap) {
      gdi32.symbols.DeleteDC(reuseMemDC as bigint);
      user32.symbols.ReleaseDC(0n, reuseScreenDC as bigint);
      reuseMemDC = null;
      reuseScreenDC = null;
      return null;
    }

    reuseOldBitmap = gdi32.symbols.SelectObject(
      reuseMemDC as bigint,
      reuseBitmap as bigint,
    );

    const size = width * height * 4;
    reuseBuffer = new Uint8Array(size);

    reuseBitmapInfo = new Uint8Array(40);
    const view = new DataView(reuseBitmapInfo.buffer);
    view.setInt32(0, 40, true);
    view.setInt32(4, width, true);
    view.setInt32(8, -height, true);
    view.setInt16(12, 1, true);
    view.setInt16(14, 32, true);
    view.setInt32(16, 0, true);

    reuseW = width;
    reuseH = height;
  }

  const success = gdi32.symbols.BitBlt(
    reuseMemDC as bigint,
    0,
    0,
    width,
    height,
    reuseScreenDC as bigint,
    x,
    y,
    0x00cc0020,
  );

  if (!success) return null;

  const result = gdi32.symbols.GetDIBits(
    reuseMemDC as bigint,
    reuseBitmap as bigint,
    0,
    height,
    ptr(reuseBuffer!),
    ptr(reuseBitmapInfo!),
    0,
  );

  if (result === 0) return null;

  return {
    width: width,
    height: height,
    buffer: reuseBuffer!,
  };
}

function cleanupReuseResources(): void {
  if (reuseOldBitmap && reuseMemDC) {
    gdi32.symbols.SelectObject(reuseMemDC as bigint, reuseOldBitmap as bigint);
  }
  if (reuseBitmap) {
    gdi32.symbols.DeleteObject(reuseBitmap as bigint);
    reuseBitmap = null;
  }
  if (reuseMemDC) {
    gdi32.symbols.DeleteDC(reuseMemDC as bigint);
    reuseMemDC = null;
  }
  if (reuseScreenDC) {
    user32.symbols.ReleaseDC(0n, reuseScreenDC as bigint);
    reuseScreenDC = null;
  }
  reuseOldBitmap = null;
  reuseBuffer = null;
  reuseBitmapInfo = null;
  reuseW = 0;
  reuseH = 0;
}

export function getScreenSize(): { width: number; height: number } {
  return {
    width: user32.symbols.GetSystemMetrics(0),
    height: user32.symbols.GetSystemMetrics(1),
  };
}
