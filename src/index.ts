import "./global";
import "./listeners";
import { robloxDetection, gameDetection } from "./workers";

(async () => {
   const [robloxReady, gameReady] = await Promise.all([
      new Promise<boolean>((res) => {
         robloxDetection.addEventListener(
            "message",
            (ev) => res(ev.data.ready),
            { once: true }
         );
      }),
      new Promise<boolean>((res) => {
         gameDetection.addEventListener("message", (ev) => res(ev.data.ready), {
            once: true,
         });
      }),
   ]);

   if (!robloxReady || !gameReady) {
      logger.error("Failed to initialize worker(s)");
      return process.exit(1);
   }

   logger.info("Waiting for Roblox (Fullscreen)...");
})();
