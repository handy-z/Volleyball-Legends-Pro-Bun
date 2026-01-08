import { mouse } from "@winput/mouse";
import { keyboard } from "@winput/keyboard";
import { robloxStates } from "@states";
import { Logger } from "@utils";
import type { Handler, InputType } from "./types";

const logger = new Logger(["Listener", "cyan"]);

export function createInputListener(
  inputType: InputType,
  handlers: Handler[],
): void {
  const handlerLookup: Record<string, Handler> = Object.create(null);
  for (let i = 0; i < handlers.length; i++) {
    handlerLookup[handlers[i].name] = handlers[i];
  }

  if (inputType === "keyboard") {
    keyboard.listener.on.down((ev) => {
      if (!robloxStates.get("is_active")) return;
      handlerLookup[ev.key]?.on?.down?.();
    });

    keyboard.listener.on.up((ev) => {
      if (!robloxStates.get("is_active")) return;
      handlerLookup[ev.key]?.on?.up?.();
    });
    logger.info("Keyboard listener started");
  } else {
    mouse.listener.on.down((ev) => {
      if (!robloxStates.get("is_active")) return;
      handlerLookup[ev.button]?.on?.down?.();
    });

    mouse.listener.on.up((ev) => {
      if (!robloxStates.get("is_active")) return;
      handlerLookup[ev.button]?.on?.up?.();
    });
    logger.info("Mouse listener started");
  }
}
