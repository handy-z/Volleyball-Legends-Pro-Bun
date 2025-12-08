import { mouse, keyboard } from "winput";
import { gameStates, robloxStates } from "../../states";

async function waitFor(callback: () => boolean) {
   while (!callback()) {
      if (
         !robloxStates.get("is_active") ||
         gameStates.get("is_toss") ||
         mouse.isPressed("x1") || !mouse.isPressed("x2")
      )
         break;
      await Bun.sleep(1);
   }
}

export const on = {
   down: async () => {
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
            let is_shift = gameStates.get("is_shift_lock");
            if (!is_shift) {
               keyboard.press("shift");
               await Bun.sleep(50);
            }
            if (
               gameStates.get("skill_toggle") &&
               gameStates.get("is_skill_ready")
            ) {
               keyboard.tap("ctrl");
               await waitFor(() => !gameStates.get("is_on_ground"));
            } else {
               keyboard.press("space");
               await waitFor(() => !gameStates.get("is_on_ground"));
               keyboard.release("space");
            }
            if (!is_shift) {
               keyboard.release("shift");
               keyboard.tap("shift");
            }
         }
      }
   },
   up: async () => {
      if (gameStates.get("is_toss")) return;
      if (!mouse.isPressed("x1")) {
         await waitFor(() => !gameStates.get("is_on_ground"));
         mouse.click();
      }
   },
};
