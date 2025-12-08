import { mouse } from "winput";
import { gameStates } from "../../states";

export const on = {
   down: async () => {
      if (!gameStates.is_toss) return;
   },
   up: async () => {
      if (!gameStates.is_toss) return;
      //    const result = await new Promise<boolean>(async (resolve) => {
      //       while (true) {
      //          if (gameStates.is_bar_arrow) {
      //             resolve(true);
      //             break;
      //          }
      //          if (!gameStates.is_toss) {
      //             resolve(false);
      //             break;
      //          }
      //          await sleep(1);
      //       }
      //    });

      //    if (!result) return;
      //    await sleep(480);
      //    mouse.click();
   },
};
