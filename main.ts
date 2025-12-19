import {
  Bot,
  Context,
  InlineQueryResultBuilder,
} from "grammy";
import {
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import { new_entry } from "./handlers/new_entry.ts";
import { register } from "./handlers/register.ts";
import { existsSync } from "node:fs";
import { createEntryTable, createUserTable } from "./db/migration.ts";
import { userExists } from "./models/user.ts";
import {
  deleteEntryById,
  getAllEntriesByUserId,
} from "./models/entry.ts";
import { InlineQueryResult } from "grammy/types";
import {
  CommandGroup,
  commandNotFound,
  commands,
  type CommandsFlavor,
} from "@grammyjs/commands";
import { FileFlavor, hydrateFiles } from "@grammyjs/files";
import { mainCustomKeyboard, registerKeyboard } from "./utils/keyboards.ts";
import { delete_account } from "./handlers/delete_account.ts";
import { view_entries } from "./handlers/view_entries.ts";
import { crisisString, helpString } from "./constants/strings.ts";
import { kitties } from "./handlers/kitties.ts";

if (import.meta.main) {
  // Check if database is present and if not create one
  try {
    // Check if db file exists if not create it and the tables
    if (!existsSync("db/jotbot.db")) {
      console.log("No Database Found creating a new database");
      createUserTable();
      createEntryTable();
    } else {
      console.log("Database found!  Starting bot.");
    }
  } catch (err) {
    console.log(`Error creating database: ${err}`);
  }
  type JotBotContext =
    & Context
    & CommandsFlavor
    & ConversationFlavor<Context>
    & FileFlavor<Context>;

  const jotBot = new Bot<JotBotContext>(
    Deno.env.get("TELEGRAM_BOT_KEY") || "",
  );
  jotBot.api.config.use(hydrateFiles(jotBot.token));
  const jotBotCommands = new CommandGroup<JotBotContext>();
  jotBot.use(commands());
  jotBot.use(conversations());

  // Setup the conversations and commands
  jotBot.use(createConversation(register));
  jotBot.use(createConversation(new_entry));
  jotBot.use(createConversation(view_entries));
  jotBot.use(createConversation(delete_account));
  jotBot.use(createConversation(kitties));

  jotBotCommands.command("start", "Starts the bot.", async (ctx) => {
    // Check if user exists in Database
    const userTelegramId = ctx.from?.id!;

    if (!userExists(userTelegramId)) {
      ctx.reply(
        `Welcome ${ctx.from?.username}!  I can see you are a new user, would you like to register now?`,
        {
          reply_markup: registerKeyboard,
        },
      );
    } else {
      await ctx.reply(
        `Hello ${ctx.from?.username} you have already completed the onboarding process.`,
        { reply_markup: mainCustomKeyboard },
      );
    }
  });

  jotBotCommands.command("help", "Show how to use the bot", async (ctx) => {
    await ctx.reply(helpString, { parse_mode: "HTML" });
  });

  jotBotCommands.command("stop", "Stop the bot", async (ctx) => {
    await ctx.reply("Okay, see ya later!");
    Deno.addSignalListener("SIGINT", () => jotBot.stop());
    Deno.addSignalListener("SIGTERM", () => jotBot.stop());
  });

  jotBotCommands.command("kitties", "Start the kitty engine!", async (ctx) => {
    await ctx.conversation.enter("kitties");
  });

  jotBotCommands.command("register", "Register new user", async (ctx) => {
    await ctx.reply("Press button to begin.", {
      reply_markup: registerKeyboard,
    });
  });

  jotBotCommands.command("new_entry", "Create new entry", async (ctx) => {
    if (!userExists(ctx.from?.id!)) {
      await ctx.reply(
        `Hello ${ctx.from?.username}!  It looks like you haven't completed the onboarding process yet.  Would you like to register to begin the registration process?`,
        { reply_markup: registerKeyboard },
      );
    } else {
      await ctx.conversation.enter("new_entry");
    }
  });

  jotBotCommands.command(
    "view_entries",
    "View current entries.",
    async (ctx) => {
      if (!userExists(ctx.from?.id!)) {
        await ctx.reply(
          `Hello ${ctx.from?.username}!  It looks like you haven't completed the onboarding process yet.  Would you like to register to begin the registration process?`,
          { reply_markup: registerKeyboard },
        );
      } else {
        await ctx.conversation.enter("view_entries");
      }
    },
  );

  jotBotCommands.command(
    "delete_account",
    "Delete your accound and all entries.",
    async (ctx) => {
      await ctx.conversation.enter("delete_account");
    },
  );

  jotBotCommands.command(
    "delete_entry",
    "Delete specific entry",
    async (ctx) => {
      let entryId: number = 0;
      if (ctx.message!.text.split(" ").length < 2) {
        await ctx.reply("Journal ID Not found.");
        return;
      } else {
        entryId = Number(ctx.message!.text.split(" ")[1]);
      }

      deleteEntryById(entryId);
    },
  );

  jotBotCommands.command(
    /(🆘|(?:sos)|)/, // ?: matches upper or lower case so no matter how sos is typed it will recognize it.
    "Show helplines and other crisis information.",
    async (ctx) => {
      await ctx.reply(crisisString.replace("<username>", ctx.from?.username!), {
        parse_mode: "HTML",
      });
    },
  );

  jotBot.on("inline_query", async (ctx) => {
    console.log((await jotBot.api.getUpdates()));
    const entries = getAllEntriesByUserId(ctx.inlineQuery.from.id);
    const entriesInlineQueryResults: InlineQueryResult[] = [];
    for (const entry in entries) {
      const entryDate = new Date(entries[entry].timestamp);
      // Build string
      const entryString = `
Date ${entryDate.toLocaleString()}
<b><u>Emotion</u></b>
${entries[entry].emotion.emotionName} ${entries[entry].emotion.emotionEmoji}

<b><u>Emotion Description</u></b>
${entries[entry].emotion.emotionDescription}

<b><u>Situation</u></b>
${entries[entry].situation}

<b><u>Automatic Thoughts</u></b>
${entries[entry].automaticThoughts}
`;
      entriesInlineQueryResults.push(
        InlineQueryResultBuilder.article(
          String(entries[entry].id),
          entryDate.toLocaleString(),
        ).text(entryString, { parse_mode: "HTML" }),
      );
    }

    await ctx.answerInlineQuery(entriesInlineQueryResults, {
      cache_time: 0,
      is_personal: true,
    });
  });

  // jotBot.on("chosen_inline_result", (ctx) => {
  //   console.log(`Inline Result Chosen: ${ctx.chosenInlineResult.result_id}`);
  //   const entry = getEntryById(Number(ctx.chosenInlineResult.result_id));

  //   // Send the entry
  //   jotBot.api.sendPhoto(ctx.in, new InputFile(entry.selfiePath!));
  //   jotBot.api.sendMessage(ctx.chatId!, entryToString(entry), {
  //     parse_mode: "HTML",
  //   });
  // });

  jotBot.callbackQuery("register-new-user", async (ctx) => {
    await ctx.conversation.enter("register");
  });

  jotBot.callbackQuery("new-entry", async (ctx) => {
    await ctx.conversation.enter("new_entry");
  });

  jotBot.catch((err) => {
    console.log(`JotBot Error: ${err.message}`);
  });
  jotBot.use(jotBotCommands);
  jotBot.filter(commandNotFound(jotBotCommands))
    .use(async (ctx) => { // Suggest closest command from an invalid command attempt
      if (ctx.commandSuggestion) {
        return ctx.reply(
          `Invalid command, did you mean ${ctx.commandSuggestion}?`,
        );
      }
      await ctx.reply("Invalid Command");
    });
  await jotBot.start();
}
