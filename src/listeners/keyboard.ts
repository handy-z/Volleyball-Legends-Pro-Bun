import { keyboard } from "winput";
import { robloxStates } from "../states";
import { keyboardHandlers } from "./keyboard/index";

keyboard.listener.on("down", (ev) => {
   if (!robloxStates.is_active) return;
   const key = ev.name;
   const handler = keyboardHandlers[key];
   if (handler && handler.on && handler.on.down) {
      handler.on.down();
   }
});

keyboard.listener.on("up", (ev) => {
   if (!robloxStates.is_active) return;
   const key = ev.name;
   const handler = keyboardHandlers[key];
   if (handler && handler.on && handler.on.up) {
      handler.on.up();
   }
});
