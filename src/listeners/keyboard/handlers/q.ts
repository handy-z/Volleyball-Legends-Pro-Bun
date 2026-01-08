import { keyboard } from "@winput/keyboard";
import { gameStates } from "@states";
import { getConfig } from "@config";
import { createHandler } from "@utils";

const isSkillToggle = () => gameStates.get("skill_toggle");
const isSkillReady = () => gameStates.get("is_skill_ready");

export default createHandler("q", {
  down: async () => {
    if (
      getConfig().skill_mode === "stealblock" &&
      isSkillToggle() &&
      isSkillReady()
    ) {
      keyboard.tap("ctrl");
      await keyboard.waitForRelease("ctrl");
    }
  },
});
