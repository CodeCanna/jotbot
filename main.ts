import { Bot, Context, InlineQueryResultBuilder } from "grammy";
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
import { deleteEntry, getAllEntries } from "./models/entry.ts";
import { Entry } from "./types/types.ts";
import { InlineQueryResult } from "grammy/types";
import {
  CommandGroup,
  commandNotFound,
  commands,
  type CommandsFlavor,
} from "@grammyjs/commands";
import { FileFlavor, hydrateFiles } from "@grammyjs/files";
import { registerKeyboard } from "./utils/keyboards.ts";
import { delete_account } from "./handlers/delete_account.ts";
import { delete_entry } from "./handlers/delete_entry.ts";

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
  jotBot.use(createConversation(register))
  jotBot.use(createConversation(new_entry))
  jotBot.use(createConversation(delete_account))

  jotBotCommands.command("start", "Starts the bot.", async (ctx) => {
    // Check if user exists in Database
    const userTelegramId = (await ctx.getAuthor()).user.id!;

    if (!userExists(userTelegramId)) {
      ctx.reply(
        `Welcome ${
          (await ctx.getAuthor()).user.username
        }!  I can see you are a new user, would you like to register now?`,
        {
          reply_markup: registerKeyboard,
        },
      );
    } else {
      await ctx.reply(
        `Hello ${
          (await ctx.getAuthor()).user.username
        } you have already completed the onboarding process.`,
      );
    }
  });

  jotBotCommands.command("register", "Register new user", async (ctx) => {
    await ctx.reply("Starting the registration process.", {
      reply_markup: registerKeyboard,
    });
  });

  jotBotCommands.command("new_entry", "Create new entry", async (ctx) => {
    if (!userExists((await ctx.getAuthor()).user.id)) {
      await ctx.reply(
        `Hello ${
          (await ctx.getAuthor()).user.username
        }!  It looks like you haven't completed the onboarding process yet.  Would you like to register to begin the registration process?`,
        { reply_markup: registerKeyboard },
      );
    } else {
      await ctx.conversation.enter("new_entry");
    }
  });

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

      deleteEntry(entryId);
    },
  );

  jotBot.on("inline_query", async (ctx) => {
    const entryQueryResults = getAllEntries(ctx.inlineQuery.from.id);

    const entries: InlineQueryResult[] = [];
    for (const e in entryQueryResults) {
      const entry: Entry = {
        id: Number(entryQueryResults[e].id!),
        userId: Number(entryQueryResults[e].userId!),
        timestamp: Number(entryQueryResults[e].timestamp!),
        situation: entryQueryResults[e].situation?.toString()!,
        automaticThoughts: entryQueryResults[e].automaticThoughts?.toString()!,
        mood: {
          moodName: entryQueryResults[e].moodName?.toString()!,
          moodEmoji: entryQueryResults[e].moodEmoji?.toString()!,
          moodDescription: entryQueryResults[e].moodDescription?.toString()!,
        },
        selfiePath: entryQueryResults[e].selfiePath?.toString()!,
      };

      const entryDate = new Date(entry.timestamp);
      // Build string
      const entryString =
        `<b><u>Entry Date ${entryDate.toLocaleString()}</u></b>
      <b>Mood</b> ${entry.mood.moodName} ${entry.mood.moodEmoji}

      <b><u>Mood Description</u></b>
      ${entry.mood.moodDescription}

      <b><u>Situation</u></b>
      ${entry.situation}

      <b><u>Automatic Thoughts</u></b>
      ${entry.automaticThoughts}`;

      if (entry.selfiePath) {
        console.log(`file://${entry.selfiePath}`);
        entries.push(
          InlineQueryResultBuilder.article(
            String(entry.id),
            entryDate.toLocaleString(),
            {
              thumbnail_url: `file://${entry.selfiePath}`,
            },
          ).text(entryString, { parse_mode: "HTML" }),
        );
      } else {
        entries.push(
          InlineQueryResultBuilder.article(
            String(entry.id),
            entryDate.toLocaleString(),
          ).text(entryString, { parse_mode: "HTML" }),
        );
      }
    }

    await ctx.answerInlineQuery(entries, {
      cache_time: 0,
      is_personal: true,
    });
  });

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
  jotBot.start();
}
