declare var self: Worker;
let robloxPort: MessagePort;
import "../global";
import { gameStates, robloxStates } from "../states";
import { checkPixelColor } from "../utils";

const workerLog = new Logger(["WORKER", "magenta"], ["GAME", "gray"]);

export interface WatchConfig {
   name: keyof typeof gameStates;
   point: [number, number];
   target: [number, number, number];
   tolerance?: number;
   conditions?: {
      name: keyof typeof gameStates;
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
      tolerance: 5,
      pollInterval: 1,
   },
   {
      name: "is_skill_ready",
      point: [1029, 903],
      target: [255, 255, 255],
      pollInterval: 1,
   },
   // {
   //    name: "is_toss",
   //    point: [956, 1040],
   //    target: [229, 164, 93],
   //    pollInterval: 50,
   // },
   // {
   //    name: "is_bar_arrow",
   //    point: [855, 853],
   //    target: [239, 239, 239],
   //    pollInterval: 1,
   //    conditions: [{ name: "is_toss", value: true }],
   // },
];

let isActive = false;

function checkConditions(conditions?: WatchConfig["conditions"]): boolean {
   if (!conditions) return true;
   for (const c of conditions) {
      const cValue = gameStates[c.name];
      if (cValue !== c.value) return false;
   }
   return true;
}

async function watchState(config: WatchConfig) {
   while (isActive) {
      await Bun.sleep(config.pollInterval ?? 5);
      if (!checkConditions(config.conditions)) {
         continue;
      }
      const isMatch = checkPixelColor(
         config.point,
         config.target,
         config.tolerance ?? 0
      );
      const lastMatch = gameStates[config.name];

      if (isMatch !== lastMatch) {
         self.postMessage({
            name: config.name,
            value: isMatch,
         });
         gameStates[config.name] = isMatch;
      }
   }
}

function startAllWatchers() {
   for (const watcher of watchers) {
      watchState(watcher).catch((err) => {
         workerLog.error(`Watcher ${watcher.name} failed:`, err);
      });
   }
}

async function watchRoblox() {
   while (true) {
      await Bun.sleep(100);
      if (robloxStates.is_active !== isActive) {
         isActive = robloxStates.is_active;
         if (isActive) {
            workerLog.info("started");
            startAllWatchers();
         } else {
            workerLog.info("stopped");
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
         if (data.name in robloxStates)
            robloxStates[data.name as keyof typeof robloxStates] = data.value;
      };
      init();
   }
};
