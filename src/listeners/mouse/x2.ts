import { mouse, keyboard } from "winput";
import { gameStates, robloxStates } from "../../states";
import { createHandler } from "../types";
import { waitFor, withLock } from "../utils";
import { getConfig } from "../../config";

function shouldAbort(): boolean {
  return (
    !robloxStates.get("is_active") ||
    gameStates.get("is_toss") ||
    mouse.isPressed("x1")
  );
}

export default createHandler("x2", {
  down: async () => {
    await withLock("x2", async () => {
      if (gameStates.get("is_toss")) return;

      while (mouse.isPressed("x2")) {
        await Bun.sleep(1);

        if (
          !robloxStates.get("is_active") ||
          gameStates.get("is_toss") ||
          mouse.isPressed("x1")
        )
          break;

        if (gameStates.get("is_on_ground")) {
          const isShift = gameStates.get("is_shift_lock");

          if (!isShift) {
            keyboard.press("shift");
            await Bun.sleep(50);
          }

          if (
            getConfig().skill_mode == "boomjump" &&
            gameStates.get("skill_toggle") &&
            gameStates.get("is_skill_ready")
          ) {
            keyboard.press("ctrl");
            await waitFor(() => !gameStates.get("is_on_ground"), shouldAbort);
            keyboard.release("ctrl");
          } else {
            keyboard.press("space");
            await waitFor(() => !gameStates.get("is_on_ground"), shouldAbort);
            keyboard.release("space");
          }

          if (!isShift) {
            keyboard.release("shift");
            keyboard.tap("shift");
          }
        }
      }
    });
  },
  up: async () => {
    await withLock("x2", async () => {
      if (gameStates.get("is_toss")) return;
      if (!mouse.isPressed("x1")) {
        await waitFor(() => !gameStates.get("is_on_ground"), shouldAbort);
        if (
          getConfig().skill_mode == "normal" &&
          gameStates.get("skill_toggle") &&
          gameStates.get("is_skill_ready")
        ) {
          keyboard.press("ctrl");
          await keyboard.waitForPress("ctrl");
          keyboard.release("ctrl");
        }
        mouse.click();
      }
    });
  },
});
