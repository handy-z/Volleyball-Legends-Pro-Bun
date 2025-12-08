import { mouse, keyboard } from "winput";
import { gameStates, robloxStates } from "../../states";

async function waitFor(callback: () => boolean) {
   while (!callback()) {
      await Bun.sleep(1);
   }
}

export const on = {
   down: async () => {
      if (gameStates.is_toss) return;

      while (mouse.isPressed("x2")) {
         await Bun.sleep(1);

         if (
            !robloxStates.is_active ||
            gameStates.is_toss ||
            mouse.isPressed("x1")
         )
            break;

         if (gameStates.is_on_ground) {
            let is_shift = gameStates.is_shift_lock;
            if (!is_shift) {
               keyboard.press("shift");
               // await waitFor(() => gameStates.is_shift_lock);
               await Bun.sleep(50);
            }
            keyboard.press("space");
            await waitFor(() => !gameStates.is_on_ground);
            keyboard.release("space");
            if (!is_shift) {
               keyboard.release("shift");
               keyboard.tap("shift");
            }
         }
      }
   },
   up: async () => {
      if (gameStates.is_toss) return;
      await waitFor(() => !gameStates.is_on_ground);
      if (!mouse.isPressed("x1")) {
         // if (gameStates.skill_toggle && gameStates.is_skill_ready) {
         //    // keyboard.press("ctrl");
         //    // keyboard.release("ctrl");
         //    keyboard.tap("ctrl", false);
         //    await waitFor(() => !gameStates.is_skill_ready);
         // }
         mouse.click();
      }
   },
};
