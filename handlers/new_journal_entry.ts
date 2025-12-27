import { Conversation } from "@grammyjs/conversations";
import { Context, InlineKeyboard } from "grammy";
import { JournalEntry } from "../types/types.ts";
import {
  getAllJournalEntriesByUserId,
  insertJournalEntry,
} from "../models/journal.ts";
import { dbFile } from "../constants/paths.ts";
import { MAX_FILE_SIZE_BYTES } from "../constants/numbers.ts";
import { downloadTelegramImage } from "../utils/misc.ts";
import { insertJournalEntryPhoto } from "../models/journal_entry_photo.ts";
import { logger } from "../utils/logger.ts";

/**
 * Starts the process of creating a new journal entry.
 * @param conversation Conversation
 * @param ctx Context
 */
export async function new_journal_entry(
  conversation: Conversation,
  ctx: Context,
) {
  if (!ctx.from) {
    await ctx.reply("Error: Unable to identify user.");
    return;
  }
  await ctx.reply(
    `Hello ${ctx.from.username || "User"}!  Tell me what is on your mind.`,
  );

  const journalEntryCtx = await conversation.waitFor("message:text");
  // Try to insert journal entry
  try {
    const journalEntry: JournalEntry = {
      userId: ctx.from.id,
      timestamp: await conversation.external(() => Date.now()),
      content: journalEntryCtx.message.text,
      length: journalEntryCtx.message.text.length,
    };
    await conversation.external(() => insertJournalEntry(journalEntry, dbFile));
  } catch (err) {
    logger.error(`Failed to insert Journal Entry: ${err}`);
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
      if (file.file_size && file.file_size > MAX_FILE_SIZE_BYTES) {
        await ctx.reply(
          `❌ File too large! Maximum size is 10MB. Your file is ${
            (file.file_size / (1024 * 1024)).toFixed(2)
          }MB.`,
        );
        continue;
      }
      const journalEntries = await conversation.external(() =>
        getAllJournalEntriesByUserId(ctx.from.id, dbFile)
      );
      const id = journalEntries[0]?.id ?? 0;
      const caption = imagesCtx.message?.caption;
      const journalEntryPhoto = await conversation.external(async () =>
        await downloadTelegramImage(
          ctx.api.token,
          caption ?? "",
          file,
          id, // Latest ID
        )
      );
      logger.debug(`Journal entry photo: ${JSON.stringify(journalEntryPhoto)}`);
      await conversation.external(() =>
        insertJournalEntryPhoto(journalEntryPhoto, dbFile)
      );
      await ctx.reply(`Saved photo!`);
      imageCount++;
    } catch (err) {
      logger.error(
        `Failed to save images for Journal Entry: ${err}`,
      );
    }
  }
  return await ctx.reply("Journaling Done!");
}
