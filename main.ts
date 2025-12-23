import { Bot, Context, InlineQueryResultBuilder } from "grammy";
import {
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import { new_entry } from "./handlers/new_entry.ts";
import { register } from "./handlers/register.ts";
import { existsSync } from "node:fs";
// import { createEntryTable, createUserTable } from "./db/migration.ts";
import { userExists } from "./models/user.ts";
import { deleteEntryById, getAllEntriesByUserId } from "./models/entry.ts";
import { InlineQueryResult } from "grammy/types";
import {
  CommandGroup,
  commandNotFound,
  commands,
  type CommandsFlavor,
} from "@grammyjs/commands";
import { FileFlavor, hydrateFiles } from "@grammyjs/files";
import {
  mainCustomKeyboard,
  registerKeyboard,
  settingsKeyboard,
} from "./utils/keyboards.ts";
import { delete_account } from "./handlers/delete_account.ts";
import { view_entries } from "./handlers/view_entries.ts";
import { crisisString, helpString } from "./constants/strings.ts";
import { kitties } from "./handlers/kitties.ts";
import { phq9_assessment } from "./handlers/phq9_assessment.ts";
import { gad7_assessment } from "./handlers/gad7_assessment.ts";
import { new_journal_entry } from "./handlers/new_journal_entry.ts";
import { dbFile } from "./constants/paths.ts";
import { createDatabase, getLatestId } from "./utils/db.ts";
import { getSettingsById, updateSettings } from "./models/settings.ts";
import { getPhqScoreById, getPhqScoreByUserId } from "./models/phq9_score.ts";

if (import.meta.main) {
  // Check if database is present and if not create one

  // Check if db file exists if not create it and the tables
  if (!existsSync(dbFile)) {
    try {
      console.log("No Database Found creating a new database");
      createDatabase(dbFile);
    } catch (err) {
      console.error(`Failed to created database: ${err}`);
    }
  } else {
    console.log("Database found!  Starting bot.");
  }

  // Check if selfie directory exists and create it if it doesn't
  if (!existsSync("assets/selfies")) {
    try {
      Deno.mkdir("assets/selfies");
    } catch (err) {
      console.error(`Failed to create selfie directory: ${err}`);
      Deno.exit(1);
    }
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
  jotBot.use(createConversation(phq9_assessment));
  jotBot.use(createConversation(gad7_assessment));
  jotBot.use(createConversation(new_journal_entry));

  jotBotCommands.command("start", "Starts the bot.", async (ctx) => {
    // Check if user exists in Database
    const userTelegramId = ctx.from?.id!;

    if (!userExists(userTelegramId, dbFile)) {
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

  jotBotCommands.command("settings", "Open the settings menu", async (ctx) => {
    await ctx.reply("Settings", { reply_markup: settingsKeyboard });
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
    if (!userExists(ctx.from?.id!, dbFile)) {
      await ctx.reply(
        `Hello ${ctx.from?.username}!  It looks like you haven't completed the onboarding process yet.  Would you like to register to begin the registration process?`,
        { reply_markup: registerKeyboard },
      );
    } else {
      await ctx.conversation.enter("new_entry");
    }
  });

  jotBotCommands.command(
    "new_journal_entry",
    "Create new journal entry",
    async (ctx) => {
      if (!userExists(ctx.from?.id!, dbFile)) {
        await ctx.reply(
          `Hello ${ctx.from?.username}!  It looks like you haven't completed the onboarding process yet.  Would you like to register to begin the registration process?`,
          { reply_markup: registerKeyboard },
        );
      } else {
        await ctx.conversation.enter("new_journal_entry");
      }
    },
  );

  jotBotCommands.command(
    "view_entries",
    "View current entries.",
    async (ctx) => {
      if (!userExists(ctx.from?.id!, dbFile)) {
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

      deleteEntryById(entryId, dbFile);
    },
  );

  jotBotCommands.command(
    /(🆘|(?:sos))/, // ?: matches upper or lower case so no matter how sos is typed it will recognize it.
    "Show helplines and other crisis information.",
    async (ctx) => {
      await ctx.reply(crisisString.replace("<username>", ctx.from?.username!), {
        parse_mode: "HTML",
      });
    },
  );

  jotBotCommands.command(
    "am_i_depressed",
    "Use PHQ-9 to attempt to rate user's depression.",
    async (ctx) => {
      await ctx.conversation.enter("phq9_assessment");
    },
  );

  jotBotCommands.command(
    "am_i_anxious",
    "Use the GAD-7 to attempt to rate user's anxiety level",
    async (ctx) => {
      await ctx.conversation.enter("gad7_assessment");
    },
  );

  jotBotCommands.command(
    "snapshot",
    "Show a snapshot of your mental health based on your data.",
    async (ctx) => {
      // Build snapshot
      const lastDepressionScore = Number(getPhqScoreById(getLatestId(dbFile, "phq_score_db"), dbFile));
      // const lastAnxietyScore = getGad
      await ctx.reply(`You mental health snapshot:
Last PHQ-9 Score: ${lastDepressionScore || "No Scores Found"}`);
    },
  );

  jotBot.on("inline_query", async (ctx) => {
    const entries = getAllEntriesByUserId(ctx.inlineQuery.from.id, dbFile);
    const entriesInlineQueryResults: InlineQueryResult[] = [];
    for (const entry in entries) {
      const entryDate = new Date(entries[entry].timestamp!);
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

  jotBot.callbackQuery("register-new-user", async (ctx) => {
    await ctx.conversation.enter("register");
  });

  jotBot.callbackQuery("new-entry", async (ctx) => {
    await ctx.conversation.enter("new_entry");
  });

  jotBot.callbackQuery(
    ["smhs", "settings-back"],
    async (ctx) => {
      switch (ctx.callbackQuery.data) {
        case "smhs": {
          const settings = getSettingsById(ctx.from?.id!, dbFile);
          console.log(settings);
          if (settings?.storeMentalHealthInfo) {
            settings.storeMentalHealthInfo = false;
            await ctx.editMessageText(
              `I will <b>NOT</b> store your GAD-7 and PHQ-9 scores`,
              {
                reply_markup: settingsKeyboard,
                parse_mode: "HTML",
              },
            );
          } else {
            settings!.storeMentalHealthInfo = true;
            await ctx.editMessageText(
              `I <b>WILL</b> store your GAD-7 and PHQ-9 scores`,
              {
                reply_markup: settingsKeyboard,
                parse_mode: "HTML",
              },
            );
          }
          updateSettings(ctx.from?.id!, settings!, dbFile);
          break;
        }
        case "settings-back": {
          ctx.editMessageText("Done with settings.");
          break;
        }
        default: {
          break;
        }
      }
    },
  );

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
