import { dlopen, FFIType, ptr, suffix } from "bun:ffi";
import { tmpdir } from "os";
import { join } from "path";
import type { ImageData } from "./types";

interface DxgiSymbols {
  dxgi_init: (outputIndex: number) => boolean;
  dxgi_capture: (
    x: number,
    y: number,
    width: number,
    height: number,
    buffer: ReturnType<typeof ptr>,
  ) => boolean;
  dxgi_get_width: () => number;
  dxgi_get_height: () => number;
  dxgi_cleanup: () => void;
}

let dxgiLib: { symbols: DxgiSymbols } | null = null;
let isInitialized = false;
let sharedBuffer: SharedArrayBuffer | null = null;
let sharedView: Uint8Array | null = null;
let lastBufferSize = 0;
let captureWidth = 0;
let captureHeight = 0;

const DXGI_SYMBOLS = {
  dxgi_init: { args: [FFIType.int], returns: FFIType.bool },
  dxgi_capture: {
    args: [FFIType.int, FFIType.int, FFIType.int, FFIType.int, FFIType.ptr],
    returns: FFIType.bool,
  },
  dxgi_get_width: { args: [], returns: FFIType.int },
  dxgi_get_height: { args: [], returns: FFIType.int },
  dxgi_cleanup: { args: [], returns: FFIType.void },
} as const;

const DLL_NAME = `dxgi-capture.${suffix}`;
const TEMP_DLL_PATH = join(tmpdir(), "vbl-pro", DLL_NAME);

function loadDxgiLibrary(): boolean {
  if (dxgiLib) return true;

  const paths = [TEMP_DLL_PATH, DLL_NAME];

  for (const dllPath of paths) {
    try {
      const lib = dlopen(dllPath, DXGI_SYMBOLS);
      dxgiLib = lib as unknown as { symbols: DxgiSymbols };
      return true;
    } catch {}
  }
  return false;
}

export function isDxgiAvailable(): boolean {
  return loadDxgiLibrary();
}

export function dxgiInit(outputIndex: number = 0): boolean {
  if (!loadDxgiLibrary()) return false;
  if (isInitialized) return true;

  const success = dxgiLib!.symbols.dxgi_init(outputIndex);
  if (success) {
    isInitialized = true;
    captureWidth = dxgiLib!.symbols.dxgi_get_width();
    captureHeight = dxgiLib!.symbols.dxgi_get_height();
  }
  return success;
}

export function captureDXGI(
  x: number,
  y: number,
  width: number,
  height: number,
): ImageData | null {
  if (!isInitialized && !dxgiInit()) return null;

  const bufferSize = width * height * 4;
  if (!sharedBuffer || lastBufferSize !== bufferSize) {
    sharedBuffer = new SharedArrayBuffer(bufferSize);
    sharedView = new Uint8Array(sharedBuffer);
    lastBufferSize = bufferSize;
  }

  const success = dxgiLib!.symbols.dxgi_capture(
    x,
    y,
    width,
    height,
    ptr(sharedView!),
  );
  if (!success) return null;

  return {
    width,
    height,
    buffer: sharedView!,
  };
}

export function dxgiCleanup(): void {
  if (!dxgiLib || !isInitialized) return;

  dxgiLib.symbols.dxgi_cleanup();
  isInitialized = false;
  sharedBuffer = null;
  sharedView = null;
  lastBufferSize = 0;
  captureWidth = 0;
  captureHeight = 0;
}

export function dxgiGetDimensions(): { width: number; height: number } | null {
  if (!isInitialized) return null;
  return { width: captureWidth, height: captureHeight };
}
