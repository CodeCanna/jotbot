import {
  ConsoleHandler,
  getLogger,
  type LevelName,
  setup,
} from "@std/log";

const LOG_LEVEL: LevelName = (
  Deno.env.get("LOG_LEVEL") || "INFO"
) as LevelName;

setup({
  handlers: {
    console: new ConsoleHandler(LOG_LEVEL),
  },
  loggers: {
    default: {
      level: LOG_LEVEL,
      handlers: ["console"],
    },
  },
});

export const logger = getLogger("JotBot");
