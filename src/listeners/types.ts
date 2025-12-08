export interface Handler {
   on?: {
      down?: () => void | Promise<void>;
      up?: () => void | Promise<void>;
   };
}
export type HandlerMap = Record<string, Handler>;