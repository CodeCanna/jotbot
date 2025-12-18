import { Context, InlineKeyboard, InputMediaBuilder } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import {
  deleteEntryById,
  getAllEntriesByUserId,
  updateEntry,
} from "../models/entry.ts";
import { Entry } from "../types/types.ts";
import { viewEntriesKeyboard } from "../utils/keyboards.ts";
import { entryFromString, sleep } from "../utils/misc.ts";
import { InputFile } from "grammy/types";

export async function view_entries(conversation: Conversation, ctx: Context) {
  let entries: Entry[] = await conversation.external(() =>
    getAllEntriesByUserId(ctx.from?.id!)
  );

  // If there are no stored entries inform user and stop conversation
  if (entries.length === 0) {
    return await ctx.api.sendMessage(ctx.chatId!, "No entries to view.");
  }

  let currentEntry: number = 0;
  let lastEditedTimestampString = `<b>Last Edited</b> ${
    entries[currentEntry].lastEditedTimestamp
      ? new Date(entries[currentEntry].lastEditedTimestamp!).toLocaleString()
      : ""
  }`;
  // Show first entry in list
  let entryString = `
Page <b>${currentEntry + 1}</b> of <b>${entries.length}</b>

<b>Date Created</b> ${
    new Date(entries[currentEntry].timestamp).toLocaleString()
  }
${entries[currentEntry].lastEditedTimestamp ? lastEditedTimestampString : ""}
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
  await ctx.api.sendPhoto(
    ctx.chatId!,
    new InputFile(entries[currentEntry].selfiePath! || "assets/404.png"),
    {
      caption: entryString,
      parse_mode: "HTML",
      reply_markup: viewEntriesKeyboard,
    },
  );

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
        await viewEntryCtx.editMessageMedia(
          InputMediaBuilder.photo(
            new InputFile(entries[currentEntry].selfiePath! || "assets/404.png"),
            {
              caption: "Are you sure you want to delete this entry?",
            },
          ),
          {
            reply_markup: new InlineKeyboard().text(
              "✅ Yes",
              "delete-entry-yes",
            )
              .text("⛔ No", "delete-entry-no"),
          },
        );
        const deleteConfirmCtx = await conversation
          .waitForCallbackQuery([
            "delete-entry-yes",
            "delete-entry-no",
          ]);

        if (
          deleteConfirmCtx.callbackQuery.data === "delete-entry-yes"
        ) {
          // Delete selfie file associated with entry
          if (entries[currentEntry].selfiePath) {
            await conversation.external(async () => {
              await Deno.remove(entries[currentEntry].selfiePath!);
            });
          }

          // Delete the current entry
          await conversation.external(() =>
            deleteEntryById(entries[currentEntry].id!)
          );

          // Refresh entries array
          entries = await conversation.external(() =>
            getAllEntriesByUserId(ctx.from?.id!)
          );

          if (entries.length === 0) {
            viewEntryCtx.editMessageText("No entries to view.");
            break loop;
          }
          break;
        } else if (
          deleteConfirmCtx.callbackQuery.data === "delete-entry-no"
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
        await viewEntryCtx.api.sendMessage(
          ctx.chatId!,
          `Copy the entry from above, edit it and send it back to me.`,
        );
        const editEntryCtx = await conversation.waitFor("message:text");

        // console.log(`Entry to edit: ${editEntryCtx.message.text}`);
        let entryToEdit: Entry;
        try {
          entryToEdit = entryFromString(editEntryCtx.message.text);

          entryToEdit.id = entries[currentEntry].id;
          entryToEdit.lastEditedTimestamp = await conversation.external(() => {
            return Date.now();
          });

          console.log(entryToEdit);
        } catch (err) {
          await editEntryCtx.reply(
            `There was an error reading your edited entry.  Make sure you are only editing the parts that YOU typed!`,
          );
          console.log(err);
        }

        await editEntryCtx.api.deleteMessage(ctx.chatId!, editEntryCtx.msgId);

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
          getAllEntriesByUserId(ctx.from?.id!)
        );

        // await viewEntryCtx.api.sendMessage(ctx.chatId!, "Entry Updated!");
        await ctx.api.editMessageText(
          ctx.chatId!,
          viewEntryCtx.msgId! + 1,
          "Message Updated!",
        );
        // Wait 3 seconds before deleting success message
        await sleep(3000);
        await ctx.api.deleteMessage(
          ctx.chatId!,
          viewEntryCtx.msgId! + 1,
        );
        break;
      }
      default: {
        throw new Error(
          `Error invalid entry in view entries: ${viewEntryCtx.callbackQuery.data}`,
        );
      }
    }

    console.log(entries[currentEntry]);

    lastEditedTimestampString = `<b>Last Edited</b> ${
      entries[currentEntry].lastEditedTimestamp
        ? new Date(entries[currentEntry].lastEditedTimestamp!).toLocaleString()
        : ""
    }`;
    entryString = `
Page <b>${currentEntry + 1}</b> of <b>${entries.length}</b>

<b>Date</b> ${new Date(entries[currentEntry].timestamp).toLocaleString()}
${entries[currentEntry].lastEditedTimestamp ? lastEditedTimestampString : ""}
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
      await viewEntryCtx.editMessageMedia(
        InputMediaBuilder.photo(
          new InputFile(entries[currentEntry].selfiePath! || "assets/404.png"),
          { caption: entryString, parse_mode: "HTML" },
        ),
        { reply_markup: viewEntriesKeyboard },
      );
    } catch (_err) { // Ignore error if message content doesn't change that just means there's only one entry in the db
      continue;
    }
  }
}
