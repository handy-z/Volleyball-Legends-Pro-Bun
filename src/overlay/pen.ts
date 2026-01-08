import type { Pointer } from "bun:ffi";
import type { RGB, PenOptions } from "./types";
import { PenStyle } from "./types";
import * as actions from "./actions";
import { OverlayWindow } from "./overlay-window";

export class Pen {
  private currentX: number = 0;
  private currentY: number = 0;
  private isDown: boolean = false;
  private penHandle: Pointer | bigint | null = null;
  private oldPen: Pointer | bigint | null = null;
  private brushHandle: Pointer | bigint | null = null;
  private oldBrush: Pointer | bigint | null = null;
  private color: RGB;
  private width: number;
  private style: PenStyle;

  constructor(
    private window: OverlayWindow,
    options: PenOptions,
  ) {
    if (!window) {
      throw new Error("OverlayWindow instance is required");
    }
    if (!options.color) {
      throw new Error("Pen color is required");
    }
    this.color = options.color;
    this.width = options.width ?? 1;
    this.style = PenStyle.PS_SOLID;
    this.createPenHandle();
  }

  private createPenHandle(): void {
    if (this.penHandle) {
      actions.deleteObject(this.penHandle);
    }

    this.penHandle = actions.createPen(this.style, this.width, this.color);

    const dc = this.window.getDC();
    if (dc && this.penHandle) {
      this.oldPen = actions.selectObject(dc, this.penHandle);
    }
  }

  move(x: number, y: number): this {
    const dc = this.window.getDC();
    if (!dc) return this;

    if (this.isDown) {
      actions.lineTo(dc, x, y);
    } else {
      actions.moveToEx(dc, x, y);
    }

    this.currentX = x;
    this.currentY = y;

    return this;
  }

  down(): this {
    this.isDown = true;
    return this;
  }

  up(): this {
    this.isDown = false;
    this.window.update();
    return this;
  }

  lineTo(x: number, y: number): this {
    const dc = this.window.getDC();
    if (!dc) return this;

    if (this.isDown) {
      actions.lineTo(dc, x, y);
    } else {
      actions.moveToEx(dc, x, y);
    }

    this.currentX = x;
    this.currentY = y;

    return this;
  }

  drawLine(x1: number, y1: number, x2: number, y2: number): this {
    try {
      const dc = this.window.getDC();
      if (!dc) {
        return this;
      }

      actions.moveToEx(dc, x1, y1);
      actions.lineTo(dc, x2, y2);
      this.window.update();

      this.currentX = x2;
      this.currentY = y2;
    } catch {}

    return this;
  }

  drawRect(x: number, y: number, width: number, height: number): this {
    const dc = this.window.getDC();
    if (!dc) return this;

    const oldBrush = actions.selectObject(
      dc,
      actions.getStockObject(actions.NULL_BRUSH),
    );
    actions.drawRectangle(dc, x, y, x + width, y + height);
    actions.selectObject(dc, oldBrush);
    this.window.update();

    return this;
  }

  drawEllipse(x: number, y: number, width: number, height: number): this {
    const dc = this.window.getDC();
    if (!dc) return this;

    const oldBrush = actions.selectObject(
      dc,
      actions.getStockObject(actions.NULL_BRUSH),
    );
    actions.drawEllipse(dc, x, y, x + width, y + height);
    actions.selectObject(dc, oldBrush);
    this.window.update();

    return this;
  }

  setColor(color: RGB): this {
    this.color = color;
    this.createPenHandle();
    return this;
  }

  setWidth(width: number): this {
    this.width = width;
    this.createPenHandle();
    return this;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.currentX, y: this.currentY };
  }

  drawFilledRect(x: number, y: number, width: number, height: number): this {
    const dc = this.window.getDC();
    if (!dc) return this;

    this.brushHandle = actions.createSolidBrush(this.color);
    this.oldBrush = actions.selectObject(dc, this.brushHandle);

    actions.drawRectangle(dc, x, y, x + width, y + height);

    if (this.oldBrush) {
      actions.selectObject(dc, this.oldBrush);
    }
    if (this.brushHandle) {
      actions.deleteObject(this.brushHandle);
      this.brushHandle = null;
    }

    this.window.update();
    return this;
  }

  drawFilledEllipse(x: number, y: number, width: number, height: number): this {
    const dc = this.window.getDC();
    if (!dc) return this;

    this.brushHandle = actions.createSolidBrush(this.color);
    this.oldBrush = actions.selectObject(dc, this.brushHandle);

    actions.drawEllipse(dc, x, y, x + width, y + height);
    if (this.oldBrush) {
      actions.selectObject(dc, this.oldBrush);
    }
    if (this.brushHandle) {
      actions.deleteObject(this.brushHandle);
      this.brushHandle = null;
    }

    this.window.update();
    return this;
  }

  drawImage(
    imageHandle: bigint,
    x: number,
    y: number,
    width?: number,
    height?: number,
  ): this {
    const dc = this.window.getDC();
    if (!dc) return this;

    const graphics = actions.createGraphicsFromHdc(dc);
    if (!graphics) return this;

    const dimensions = actions.getImageDimensions(imageHandle);
    const drawWidth = width ?? dimensions?.width ?? 0;
    const drawHeight = height ?? dimensions?.height ?? 0;

    actions.drawImageToGraphics(
      graphics,
      imageHandle,
      x,
      y,
      drawWidth,
      drawHeight,
    );
    actions.deleteGraphics(graphics);

    this.window.update();
    return this;
  }

  static loadImage(filePath: string): bigint | null {
    return actions.loadImageFromFile(filePath);
  }

  static disposeImage(imageHandle: bigint): void {
    actions.disposeImage(imageHandle);
  }

  drawAntiAliasedEllipse(
    x: number,
    y: number,
    width: number,
    height: number,
    argbColor: number,
    penWidth: number,
  ): this {
    const dc = this.window.getDC();
    if (!dc) return this;

    actions.drawAntiAliasedEllipse(
      dc,
      x,
      y,
      width,
      height,
      argbColor,
      penWidth,
    );
    this.window.update();
    return this;
  }

  destroy(): void {
    const dc = this.window.getDC();

    if (dc && this.oldPen) {
      actions.selectObject(dc, this.oldPen);
      this.oldPen = null;
    }
    if (this.penHandle) {
      actions.deleteObject(this.penHandle);
      this.penHandle = null;
    }

    if (this.brushHandle) {
      actions.deleteObject(this.brushHandle);
      this.brushHandle = null;
    }
  }
}
