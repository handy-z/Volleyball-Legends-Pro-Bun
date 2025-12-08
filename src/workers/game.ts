declare var self: Worker;
let robloxPort: MessagePort;
import "../global";
import { gameStates, robloxStates, type GameStateShape } from "../states";
import { checkPixelColor } from "../utils";

const workerLog = new Logger(["WORKER", "magenta"], ["GAME", "gray"]);

export interface WatchConfig {
   name: keyof GameStateShape;
   point: [number, number];
   target: [number, number, number];
   tolerance?: number;
   conditions?: {
      name: keyof GameStateShape;
      value: boolean;
   }[];
   pollInterval?: number;
   defaultValue?: boolean;
}

const watchers: WatchConfig[] = [
   {
      name: "is_on_ground",
      point: [942, 1003],
      target: [255, 225, 148],
      pollInterval: 1,
   },
   {
      name: "is_shift_lock",
      point: [1807, 969],
      target: [47, 85, 104],
      tolerance: 10,
      pollInterval: 1,
   },
   {
      name: "is_skill_ready",
      point: [1029, 903],
      target: [255, 255, 255],
      pollInterval: 1,
   },
];

let isActive = false;
let watcherAbortController: AbortController | null = null;

function checkConditions(conditions?: WatchConfig["conditions"]): boolean {
   if (!conditions) return true;
   for (const c of conditions) {
      const cValue = gameStates.get(c.name);
      if (cValue !== c.value) return false;
   }
   return true;
}

async function watchState(config: WatchConfig, signal: AbortSignal) {
   while (!signal.aborted && isActive) {
      await Bun.sleep(config.pollInterval ?? 5);

      if (signal.aborted) break;
      if (!checkConditions(config.conditions)) continue;

      const isMatch = checkPixelColor(
         config.point,
         config.target,
         config.tolerance ?? 0
      );
      const lastMatch = gameStates.get(config.name);

      if (isMatch !== lastMatch) {
         self.postMessage({
            name: config.name,
            value: isMatch,
         });
         gameStates.set(config.name, isMatch);
      }
   }
}

function startAllWatchers() {
   stopAllWatchers();
   watcherAbortController = new AbortController();

   for (const watcher of watchers) {
      watchState(watcher, watcherAbortController.signal).catch((err) => {
         if (err.name !== "AbortError") {
            workerLog.error(`Watcher ${watcher.name} failed:`, err);
         }
      });
   }
}

function stopAllWatchers() {
   if (watcherAbortController) {
      watcherAbortController.abort();
      watcherAbortController = null;
   }
   gameStates.reset();
}

async function watchRoblox() {
   while (true) {
      await Bun.sleep(100);
      const robloxActive = robloxStates.get("is_active");
      if (robloxActive !== isActive) {
         isActive = robloxActive;
         if (isActive) {
            workerLog.info("started");
            startAllWatchers();
         } else {
            workerLog.info("stopped");
            stopAllWatchers();
         }
      }
   }
}

function init() {
   watchRoblox();
   workerLog.info("running");
   self.postMessage({ ready: true });
}

self.onmessage = ({ data }) => {
   if (data instanceof MessagePort) {
      robloxPort = data;
      robloxPort.onmessage = ({ data }) => {
         if (data.name in robloxStates.toObject()) {
            robloxStates.set(data.name, data.value);
         }
      };
      init();
   }
};
