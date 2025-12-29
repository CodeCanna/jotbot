import { Conversation } from "@grammyjs/conversations";
import { Context, InlineKeyboard } from "grammy";
import { JournalEntry } from "../types/types.ts";
import {
  getAllJournalEntriesByUserId,
  insertJournalEntry,
} from "../models/journal.ts";
import { dbFile } from "../constants/paths.ts";
import { downloadTelegramImage } from "../utils/misc.ts";
import { insertJournalEntryPhoto } from "../models/journal_entry_photo.ts";

/**
 * Starts the process of creating a new journal entry.
 * @param conversation Conversation
 * @param ctx Context
 */
export async function new_journal_entry(
  conversation: Conversation,
  ctx: Context,
) {
  await ctx.reply(
    `Hello ${ctx.from?.username!}!  Tell me what is on your mind.`,
  );

  const journalEntryCtx = await conversation.waitFor("message:text");
  // Try to insert journal entry
  try {
    const journalEntry: JournalEntry = {
      userId: ctx.from?.id!,
      timestamp: await conversation.external(() => Date.now()),
      content: journalEntryCtx.message.text,
      length: journalEntryCtx.message.text.length,
    };
    await conversation.external(() => insertJournalEntry(journalEntry, dbFile));
  } catch (err) {
    console.error(`Failed to insert Journal Entry: ${err}`);
    await ctx.reply(`Failed to insert Journal Entry: ${err}`);
    throw new Error(`Failed to insert Journal Entry: ${err}`);
  }
  await ctx.reply(`Successfully saved journal entry!`);

  let imageCount = 0;
  while (true) {
    await ctx.reply(
      `Send me an image or click done.  You have sent ${imageCount} images.`,
      { reply_markup: new InlineKeyboard().text("Done", "photo-done") },
    );

    const imagesCtx = await conversation.waitFor([
      "message:photo",
      "callback_query",
    ]);

    if (imagesCtx.callbackQuery?.data === "photo-done") {
      break;
    }

    try {
      const file = await imagesCtx.getFile();
      const id = await conversation.external(() =>
        getAllJournalEntriesByUserId(ctx.from?.id!, dbFile)[0].id!
      );
      const journalEntryPhoto = await conversation.external(async () =>
        await downloadTelegramImage(
          ctx.api.token,
          imagesCtx.message?.caption!,
          file,
          id, // Latest ID
        )
      );
      console.log(journalEntryPhoto);
      await conversation.external(() =>
        insertJournalEntryPhoto(journalEntryPhoto, dbFile)
      );
      await ctx.reply(`Saved photo!`);
      imageCount++;
    } catch (err) {
      console.error(
        `Failed to save images for Journal Entry ${getAllJournalEntriesByUserId(
          ctx.from?.id!,
          dbFile,
        )[0].id!}: ${err}`,
      );
    }
  }
  return await ctx.reply("Journaling Done!");
}
