import * as actions from "./actions";
import * as dxgi from "./dxgi";

class Screen {
  getScreenSize = actions.getScreenSize;
  captureReuse = actions.captureReuse;
  isDxgiAvailable = dxgi.isDxgiAvailable;
  captureDXGI = dxgi.captureDXGI;
}

export const screen = new Screen();

export type { ImageData, RGB, Point } from "./types";
