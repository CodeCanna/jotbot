import { Context, InlineKeyboard } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { deleteEntry, getEntriesByUserId } from "../models/entry.ts";
import { Entry } from "../types/types.ts";
import { viewEntriesKeyboard } from "../utils/keyboards.ts";

export async function view_entries(conversation: Conversation, ctx: Context) {
  let entries: Entry[] = getEntriesByUserId(ctx.from?.id!);
  let currentEntry: number = 0;

  const entryString = `
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
  await ctx.reply(entryString, {
    reply_markup: viewEntriesKeyboard,
    parse_mode: "HTML",
  });
  loop:
  while (true) {
    const viewEntryCtx = await conversation.waitForCallbackQuery([
      "previous-entry",
      "delete-entry",
      "next-entry",
      "view-entry-backbutton",
    ]);

    switch (viewEntryCtx.callbackQuery.data) {
      case ("next-entry"): {
        currentEntry++;
        break;
      }
      case ("previous-entry"): {
        currentEntry--;
        break;
      }
      case ("delete-entry"): {
        await viewEntryCtx.editMessageText(
          "Are you sure you want to delete this entry?",
          {
            reply_markup: new InlineKeyboard().text("✅ Yes", "delete-entry-yes")
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
      case ("view-entry-backbutton"): {
        await viewEntryCtx.deleteMessage();
        break loop;
      }
      default: {
        throw new Error(
          `Error invalid entry in view entries: ${viewEntryCtx.callbackQuery.data}`,
        );
      }
    }


    let nextEntryString;
    if (
      entries[currentEntry] && currentEntry <= entries.length &&
      currentEntry >= 0
    ) {
      nextEntryString = `
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

      await viewEntryCtx.editMessageText(nextEntryString, {
        reply_markup: viewEntriesKeyboard,
        parse_mode: "HTML",
      });
    } else if (currentEntry >= entries.length && (!entries[currentEntry])) {
      const viewEntriesKeyboard = new InlineKeyboard()
        .text("⏮️", "previous-entry").row()
        .text("Exit", "view-entry-backbutton");

      await viewEntryCtx.editMessageText("End of list", {
        reply_markup: viewEntriesKeyboard,
        parse_mode: "HTML",
      });
    } else if (currentEntry <= 0 && (!entries[currentEntry])) {
      const viewEntriesKeyboard = new InlineKeyboard()
        .text("⏭️", "next-entry").row()
        .text("Exit", "view-entry-backbutton");

      await viewEntryCtx.editMessageText("Beginning of list", {
        reply_markup: viewEntriesKeyboard,
        parse_mode: "HTML",
      });
    }
  }
}
