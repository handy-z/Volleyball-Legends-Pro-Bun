import { keyboard } from "winput";

export const on = {
   down: async () => {
      keyboard.tap("esc");
      await Bun.sleep(50);
      keyboard.tap("r");
      await Bun.sleep(50);
      keyboard.tap("enter");
   },
};
