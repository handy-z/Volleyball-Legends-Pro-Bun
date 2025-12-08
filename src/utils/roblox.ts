import { getForegroundWindowInfo } from "./window";

export function isRobloxForeground(): boolean {
   const windowInfo = getForegroundWindowInfo();
   if (!windowInfo) return false;

   return windowInfo.title == "Roblox";
}

export function isRobloxFullscreen(): boolean {
   const windowInfo = getForegroundWindowInfo();
   if (!windowInfo) return false;

   return windowInfo.isFullscreen;
}
