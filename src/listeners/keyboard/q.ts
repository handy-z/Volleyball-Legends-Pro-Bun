import { gameStates } from "../../states";
import { createHandler } from "../types";
import { withLock } from "../utils";
import { getConfig } from "../../config";
import { keyboard } from "winput";

export default createHandler("q", {
  down: async () => {
    await withLock("q", async () => {
      if (
        getConfig().skill_mode == "stealblock" &&
        gameStates.get("skill_toggle") &&
        gameStates.get("is_skill_ready")
      ) {
        keyboard.tap("ctrl");
        await keyboard.waitForRelease("ctrl");
      }
    });
  },
});
