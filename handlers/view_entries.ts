import { Context, InlineKeyboard } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { deleteEntry, getEntriesByUserId } from "../models/entry.ts";
import { Entry } from "../types/types.ts";
import { viewEntriesKeyboard } from "../utils/keyboards.ts";

export async function view_entries(conversation: Conversation, ctx: Context) {
  let entries: Entry[] = await conversation.external(() =>
    getEntriesByUserId(ctx.from?.id!)
  );
  if (entries.length === 0) {
    conversation.halt();
    return await ctx.reply("No entries found.");
  }
  let currentEntry: number = 0;

  // Show first entry in list
  let entryString = `
Page <b>${currentEntry + 1}</b> of <b>${entries.length}</b>

<b>Date</b> ${new Date(entries[currentEntry].timestamp).toLocaleString()}
<b><u>Emotion</u></b>
${entries[currentEntry].emotion.emotionName} ${
    entries[currentEntry].emotion.emotionEmoji
  }

<b><u>Emotion Description</u></b>
${entries[currentEntry].emotion.emotionDescription}

<b><u>Situation</u></b>
${entries[currentEntry].situation}

<b><u>Automatic Thoughts</u></b>
${entries[currentEntry].automaticThoughts}

Page <b>${currentEntry + 1}</b> of <b>${entries.length}</b>
`;

  // Reply initially with first entry before starting loop
  await ctx.reply(entryString, {
    reply_markup: viewEntriesKeyboard,
    parse_mode: "HTML",
  });
  loop:
  while (true) {
    // If user deletes all entries through this menu
    if (entries.length === 0) {
      ctx.editMessageText("No entries found.");
      continue;
    }

    const viewEntryCtx = await conversation.waitForCallbackQuery([
      "previous-entry",
      "delete-entry",
      "next-entry",
      "view-entry-backbutton",
    ]);

    switch (viewEntryCtx.callbackQuery.data) {
      case "next-entry": {
        // Check if there are more than one entry in db
        if (entries.length > 1) {
          if (currentEntry >= entries.length - 1) {
            currentEntry = 0;
            break;
          }
          currentEntry++;
        }
        break;
      }
      case "previous-entry": {
        // Check if there are more than one entry in db
        if (entries.length > 1) {
          if (currentEntry <= 0) {
            currentEntry = entries.length - 1;
            break;
          }
          currentEntry--;
        }
        break;
      }
      case "delete-entry": {
        await viewEntryCtx.editMessageText(
          "Are you sure you want to delete this entry?",
          {
            reply_markup: new InlineKeyboard().text(
              "✅ Yes",
              "delete-entry-yes",
            )
              .text("⛔ No", "delete-entry-no"),
          },
        );
        const deleteEntryConfirmCtx = await conversation.waitForCallbackQuery([
          "delete-entry-yes",
          "delete-entry-no",
        ]);

        if (deleteEntryConfirmCtx.callbackQuery.data === "delete-entry-yes") {
          await conversation.external(() => {
            // Delete the current entry
            deleteEntry(entries[currentEntry].id!);
            // Refresh entries array
            entries = getEntriesByUserId(ctx.from?.id!);
          });
          break;
        } else if (
          deleteEntryConfirmCtx.callbackQuery.data === "delete-entry-no"
        ) {
          break;
        } else {
          break;
        }
      }
      case "view-entry-backbutton": {
        await viewEntryCtx.deleteMessage();
        break loop;
      }
      default: {
        throw new Error(
          `Error invalid entry in view entries: ${viewEntryCtx.callbackQuery.data}`,
        );
      }
    }

    entryString = `
Page <b>${currentEntry + 1}</b> of <b>${entries.length}</b>

<b>Date</b> ${new Date(entries[currentEntry].timestamp).toLocaleString()}
<b><u>Emotion</u></b>
${entries[currentEntry].emotion.emotionName} ${
      entries[currentEntry].emotion.emotionEmoji
    }

<b><u>Emotion Description</u></b>
${entries[currentEntry].emotion.emotionDescription}

<b><u>Situation</u></b>
${entries[currentEntry].situation}

<b><u>Automatic Thoughts</u></b>
${entries[currentEntry].automaticThoughts}

Page <b>${currentEntry + 1}</b> of <b>${entries.length}</b>
`;

    try {
      await viewEntryCtx.editMessageText(entryString, {
        reply_markup: viewEntriesKeyboard,
        parse_mode: "HTML",
      });
    } catch (_err) { // Ignore error if message content doesn't change that just means there's only one entry in the db
      continue;
    }
  }
}
