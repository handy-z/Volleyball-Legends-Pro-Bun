import { gameStates } from "../../states";

export const on = {
   down: async () => {
      const current = gameStates.get("skill_toggle");
      gameStates.set("skill_toggle", !current);
      console.log(`---- Skill toggle is now ${!current ? "ENABLED" : "DISABLED"} ----`);
   },
};
