import { gameStates } from "../../states";

export const on = {
   down: async () => {
      gameStates.skill_toggle = !gameStates.skill_toggle;
      console.log(`Skill toggle is now ${gameStates.skill_toggle ? "enabled" : "disabled"}`);
   },
};
