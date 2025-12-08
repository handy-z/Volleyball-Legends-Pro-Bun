import { createInputListener } from "./factory";
import { mouseHandlers } from "./mouse/index";

createInputListener("mouse", mouseHandlers, (ev) => ev.button ?? "");
