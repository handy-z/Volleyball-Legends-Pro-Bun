import { mouse } from "winput";
import { robloxStates } from "../states";
import { mouseHandlers } from "./mouse/index";

mouse.listener.on("down", (ev) => {
   if (!robloxStates.is_active) return;
   const button = ev.button;
   const handler = mouseHandlers[button];
   if (handler && handler.on && handler.on.down) {
      handler.on.down();
   }
});

mouse.listener.on("up", (ev) => {
   if (!robloxStates.is_active) return;
   const button = ev.button;
   const handler = mouseHandlers[button];
   if (handler && handler.on && handler.on.up) {
      handler.on.up();
   }
});
