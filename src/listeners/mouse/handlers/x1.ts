import { mouse } from "@winput/mouse";
import { keyboard } from "@winput/keyboard";
import { gameStates, programStates, robloxStates } from "@states";
import { createHandler, waitFor } from "@utils";

const isEnabled = () => programStates.get("is_enabled");
const isActive = () => robloxStates.get("is_active");
const isToss = () => gameStates.get("is_toss");
const isOnGround = () => gameStates.get("is_on_ground");

const shouldAbortX1Down = () =>
  !isEnabled() ||
  !isActive() ||
  isToss() ||
  (isOnGround() && !mouse.isPressed("x1"));

const shouldAbortX1Up = () => !isEnabled() || !isActive() || isToss();

export default createHandler("x1", {
  down: async () => {
    if (isToss()) return;
    if (!mouse.isPressed("x2")) {
      keyboard.tap("space");
    }
    const success = await waitFor(() => !isOnGround(), shouldAbortX1Down);
    if (success) {
      keyboard.press("e");
    }
  },
  up: async () => {
    if (isToss()) return;
    const success = await waitFor(
      () => !isOnGround() || !mouse.isPressed("x1"),
      shouldAbortX1Up,
    );
    if (success) {
      keyboard.release("e");
    }
  },
});
