import { pauseListeners, resumeListeners } from "../utils";
import { gameStates, robloxStates } from "../states";
import path from "path";

async function createWorkerFromFile(
   filePath: string,
   options?: WorkerOptions
): Promise<Worker> {
   const text = await Bun.file(filePath).text();
   const blob = new Blob([text], { type: "application/javascript" });
   const url = URL.createObjectURL(blob);
   return new Worker(url, options);
}

const robloxPath = path.join(path.dirname(Bun.main), "workers/roblox.js");
const gamePath = path.join(path.dirname(Bun.main), "workers/game.js");

export let robloxDetection: Worker;
export let gameDetection: Worker;

if (process.execPath.endsWith('vbl-pro-bun.exe')) {

   robloxDetection = await createWorkerFromFile(robloxPath, {
      type: "module",
   });
   gameDetection = await createWorkerFromFile(gamePath, {
      type: "module",
   });
}
else {
   robloxDetection = new Worker(robloxPath, { type: "module" });
   gameDetection = new Worker(gamePath, { type: "module" });
}

const { port1, port2 } = new MessageChannel();

robloxDetection.postMessage(port1, [port1]);
gameDetection.postMessage(port2, [port2]);

robloxDetection.onmessage = ({ data }) => {
   if (data.name in robloxStates) {
      robloxStates[data.name as keyof typeof robloxStates] = data.value;
      if (data.name === "is_active") {
         if (data.value) resumeListeners();
         else pauseListeners();
      }
   }
};
gameDetection.onmessage = ({ data }) => {
   if (data.name in gameStates) {
      gameStates[data.name as keyof typeof gameStates] = data.value;
   }
};
