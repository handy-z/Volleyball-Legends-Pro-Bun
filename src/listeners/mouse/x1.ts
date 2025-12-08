import { keyboard } from "winput";
import { gameStates } from "../../states";

export const on = {
   down: async () => {
      if (gameStates.is_toss) return;
      keyboard.tap("space");
      await keyboard.waitForRelease("space");
      keyboard.press("e");
   },
   up: async () => {
      if (gameStates.is_toss) return;
      keyboard.release("e");
   },
};
