import { programStates } from "@states";
import { createHandler } from "@utils";

const getIsEnabled = () => programStates.get("is_enabled");

export default createHandler("f5", {
  down: async () => {
    const current = getIsEnabled();
    programStates.set("is_enabled", !current);
    console.log(
      `---- Aim line toggle is now ${!current ? "ENABLED" : "DISABLED"} ----`,
    );
  },
});
