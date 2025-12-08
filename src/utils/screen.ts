import { gdi32 } from "./gdi32";
import { user32 } from "./user32";

export interface RGB {
   r: number;
   g: number;
   b: number;
}

export function colorrefToRGB(colorref: number): RGB {
   return {
      r: colorref & 0xff,
      g: (colorref >> 8) & 0xff,
      b: (colorref >> 16) & 0xff,
   };
}

export function checkPixelColor(
   point: [number, number],
   target: [number, number, number],
   tolerance = 0
): boolean {
   const desktopDC = user32.symbols.GetDC(null);
   if (!desktopDC) {
      return false;
   }

   try {
      const colorref = gdi32.symbols.GetPixel(desktopDC, point[0], point[1]);
      const pixel = colorrefToRGB(colorref);

      const rDiff = Math.abs(pixel.r - target[0]);
      const gDiff = Math.abs(pixel.g - target[1]);
      const bDiff = Math.abs(pixel.b - target[2]);

      const matches =
         rDiff <= tolerance && gDiff <= tolerance && bDiff <= tolerance;

      return matches;
   } finally {
      user32.symbols.ReleaseDC(null, desktopDC);
   }
}