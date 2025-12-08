import { keyboard, mouse } from "winput";
import { robloxStates } from "../states";
import type { HandlerMap } from "./types";

interface InputEvent {
   name?: string;
   button?: string;
}

export function createInputListener(
   inputType: "keyboard" | "mouse",
   handlers: HandlerMap,
   getKey: (ev: InputEvent) => string
): void {
   if (inputType === "keyboard") {
      keyboard.listener.on("down", (ev) => {
         if (!robloxStates.get("is_active")) return;
         const handler = handlers[ev.name];
         handler?.on?.down?.();
      });

      keyboard.listener.on("up", (ev) => {
         if (!robloxStates.get("is_active")) return;
         const handler = handlers[ev.name];
         handler?.on?.up?.();
      });
   } else {
      mouse.listener.on("down", (ev) => {
         if (!robloxStates.get("is_active")) return;
         const handler = handlers[ev.button];
         handler?.on?.down?.();
      });

      mouse.listener.on("up", (ev) => {
         if (!robloxStates.get("is_active")) return;
         const handler = handlers[ev.button];
         handler?.on?.up?.();
      });
   }
}
