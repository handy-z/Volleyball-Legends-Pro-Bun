import { mouse } from "winput";
import { gameStates } from "../../states";

export const on = {
   down: async () => {
      if (!gameStates.get("is_toss")) return;
   },
   up: async () => {
      if (!gameStates.get("is_toss")) return;
   },
};
