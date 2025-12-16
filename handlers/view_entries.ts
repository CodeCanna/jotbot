import { Context, InlineKeyboard } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import {
  deleteEntryById,
  getEntriesByUserId,
  updateEntry,
} from "../models/entry.ts";
import { Entry } from "../types/types.ts";
import { viewEntriesKeyboard } from "../utils/keyboards.ts";
import { entryFromString } from "../utils/entryFromString.ts";

export async function view_entries(conversation: Conversation, ctx: Context) {
  let entries: Entry[] = await conversation.external(() =>
    getEntriesByUserId(ctx.from?.id!)
  );

  // If there are no stored entries inform user and stop conversation
  if (entries.length === 0) {
    return await ctx.reply("No entries to view.");
  }

  let currentEntry: number = 0;
  // Show first entry in list
  let entryString = `
Page <b>${currentEntry + 1}</b> of <b>${entries.length}</b>

<b>Date</b> ${new Date(entries[currentEntry].timestamp).toLocaleString()}
<b><u>Emotion</u></b>
${entries[currentEntry].emotion.emotionName} ${
    entries[currentEntry].emotion.emotionEmoji || ""
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
      return await ctx.editMessageText("No entries found.");
    }

    const viewEntryCtx = await conversation.waitForCallbackQuery([
      "previous-entry",
      "delete-entry",
      "next-entry",
      "view-entry-backbutton",
      "edit-entry",
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
        const deleteEntryByIdConfirmCtx = await conversation
          .waitForCallbackQuery([
            "delete-entry-yes",
            "delete-entry-no",
          ]);

        if (
          deleteEntryByIdConfirmCtx.callbackQuery.data === "delete-entry-yes"
        ) {
          // Delete the current entry
          await conversation.external(() =>
            deleteEntryById(entries[currentEntry].id!)
          );
          // Refresh entries array
          entries = await conversation.external(() =>
            getEntriesByUserId(ctx.from?.id!)
          );

          if (entries.length === 0) {
            viewEntryCtx.editMessageText("No entries to view.");
            break loop;
          }
          break;
        } else if (
          deleteEntryByIdConfirmCtx.callbackQuery.data === "delete-entry-no"
        ) {
          break;
        }
        break;
      }
      case "view-entry-backbutton": {
        await viewEntryCtx.deleteMessage();
        break loop;
      }
      case "edit-entry": {
        await viewEntryCtx.reply(
          `Copy the entry from above, edit it and send it back to me.`,
        );
        const editEntryCtx = await conversation.waitFor("message:text");

        // console.log(`Entry to edit: ${editEntryCtx.message.text}`);
        let entryToEdit: Entry;
        try {
          entryToEdit = entryFromString(editEntryCtx.message.text);

          entryToEdit.id = entries[currentEntry].id;
          entryToEdit.lastEditedTimestamp = await conversation.external(() =>
            Date.now()
          );

          console.log(entryToEdit);
        } catch (err) {
          await editEntryCtx.reply(
            `There was an error reading your edited entry.  Make sure you are only editing the parts that YOU typed!`,
          );
          console.log(err);
        }

        try {
          await conversation.external(() =>
            updateEntry(entryToEdit.id!, entryToEdit)
          );
        } catch (err) {
          await editEntryCtx.reply(
            `I'm sorry I ran into an error while trying to save your changes.`,
          );
          console.log(err);
        }
        // Refresh entries
        entries = await conversation.external(() =>
          getEntriesByUserId(ctx.from?.id!)
        );
        break;
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
      entries[currentEntry].emotion.emotionEmoji || ""
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
