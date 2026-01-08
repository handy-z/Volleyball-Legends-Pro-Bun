import { gameStates } from "@states";
import { createHandler } from "@utils";

const getSkillToggle = () => gameStates.get("skill_toggle");

export default createHandler("f4", {
  down: async () => {
    const current = getSkillToggle();
    gameStates.set("skill_toggle", !current);
    console.log(
      `---- Skill toggle is now ${!current ? "ENABLED" : "DISABLED"} ----`,
    );
  },
});
