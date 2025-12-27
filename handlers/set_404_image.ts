import { Context } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { updateCustom404Image } from "../models/settings.ts";
import { getTelegramDownloadUrl } from "../constants/strings.ts";
import { dbFile } from "../constants/paths.ts";
import { MAX_FILE_SIZE_BYTES } from "../constants/numbers.ts";
import { logger } from "../utils/logger.ts";

export async function set_404_image(conversation: Conversation, ctx: Context) {
  logger.info(`Starting 404 image setup for user ${ctx.from?.id}`);

  await ctx.reply(
    "🖼️ <b>Set Custom 404 Image</b>\n\nSend me an image that will be shown when viewing journal entries that don't have selfies.\n\n<i>This image will be displayed as a placeholder for entries without photos.</i>\n\nSend to image now:",
    { parse_mode: "HTML" },
  );

  logger.debug(`Waiting for photo from user ${ctx.from?.id}`);
  const photoCtx = await conversation.waitFor("message:photo");
  logger.debug(`Received photo message: ${!!photoCtx.message.photo}`);

  if (!photoCtx.message.photo) {
    logger.warn(`No photo in message from user ${ctx.from?.id}`);
    await ctx.reply("No photo received. Operation cancelled.");
    return;
  }

  const photo = photoCtx.message.photo[photoCtx.message.photo.length - 1]; // Get largest
  logger.debug(
    `Selected largest photo: file_id=${photo.file_id}, size=${photo.file_size}`,
  );

  logger.debug(`Getting file info for ${photo.file_id}`);
  let tmpFile;
  try {
    tmpFile = await ctx.api.getFile(photo.file_id);
    logger.debug(
      `File info received: path=${tmpFile.file_path}, size=${tmpFile.file_size}`,
    );
  } catch (error) {
    logger.error(`Failed to get file info: ${error}`);
    await ctx.reply(
      "❌ Failed to process the image. Please try uploading again.",
    );
    return;
  }

  if (tmpFile.file_size && tmpFile.file_size > 5_000_000) { // 5MB limit
    logger.warn(`File too large: ${tmpFile.file_size} bytes`);
    await ctx.reply(
      "Image is too large (max 5MB). Please try a smaller image.",
    );
    return;
  }

  const photo = photoCtx.message.photo[photoCtx.message.photo.length - 1]; // Get largest
  logger.debug(
    `Selected largest photo: file_id=${photo.file_id}, size=${photo.file_size}`,
  );

  logger.debug(`Getting file info for ${photo.file_id}`);
  let tmpFile;
  try {
    tmpFile = await ctx.api.getFile(photo.file_id);
    logger.debug(
      `File info received: path=${tmpFile.file_path}, size=${tmpFile.file_size}`,
    );
  } catch (error) {
    logger.error(`Failed to get file info: ${error}`);
    await ctx.reply(
      "❌ Failed to process image. Please try uploading again.",
    );
    return;
  }

  if (tmpFile.file_size && tmpFile.file_size > 5_000_000) { // 5MB limit
    logger.warn(`File too large: ${tmpFile.file_size} bytes`);
    await ctx.reply(
      "Image is too large (max 5MB). Please try a smaller image.",
    );
    return;
  }

  // Extract relative file path from absolute server path
  // Telegram API expects paths like "photos/file_0.jpg", not "/var/lib/telegram-bot-api/.../photos/file_0.jpg"
  let relativeFilePath = tmpFile.file_path!;
  if (
    relativeFilePath.includes("/photos/") ||
    relativeFilePath.includes("/documents/") ||
    relativeFilePath.includes("/videos/")
  ) {
    // Find the last occurrence of known Telegram file directories
    const photoIndex = relativeFilePath.lastIndexOf("/photos/");
    const docIndex = relativeFilePath.lastIndexOf("/documents/");
    const videoIndex = relativeFilePath.lastIndexOf("/videos/");

    const lastIndex = Math.max(photoIndex, docIndex, videoIndex);
    if (lastIndex !== -1) {
      relativeFilePath = relativeFilePath.substring(lastIndex + 1); // Remove the leading slash
    }
  }

  logger.debug(`Using relative file path: ${relativeFilePath}`);

  try {
    const baseUrl = (ctx.api as { options?: { apiRoot?: string } }).options
      ?.apiRoot ||
      "https://api.telegram.org";
    const downloadUrl = getTelegramDownloadUrl(
      baseUrl,
      ctx.api.token,
      relativeFilePath,
    );

    logger.debug(`Base URL: ${baseUrl}`);
    logger.debug(`Download URL: ${downloadUrl}`);

    logger.debug(`Starting fetch request...`);
    let response = await fetch(downloadUrl, {
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    logger.debug(
      `Fetch response: status=${response.status}, ok=${response.ok}`,
    );

    // If custom API fails, try official API as fallback
    if (!response.ok && baseUrl !== "https://api.telegram.org") {
      logger.info(
        `Custom API failed, trying official Telegram API as fallback...`,
      );
      const officialUrl = getTelegramDownloadUrl(
        "https://api.telegram.org",
        ctx.api.token,
        relativeFilePath,
      );
      logger.debug(`Official URL: ${officialUrl}`);

      response = await fetch(officialUrl, {
        signal: AbortSignal.timeout(30000),
      });

      logger.debug(
        `Official response: status=${response.status}, ok=${response.ok}`,
      );
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No error text");
      logger.error(
        `Download failed: status=${response.status}, body="${errorText}"`,
      );
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const fileName = `${ctx.from?.id}_404.jpg`;
    const filePath = `assets/404/${fileName}`;
    logger.debug(`Saving to: ${filePath}`);

    const file = await Deno.open(filePath, {
      write: true,
      create: true,
    });

    logger.debug(`Starting file download...`);
    await response.body!.pipeTo(file.writable);
    logger.debug(`File download completed`);

    // Update settings
    logger.debug(`Updating database settings`);
    updateCustom404Image(ctx.from!.id, filePath, dbFile);
    logger.debug(`Settings updated successfully`);

    await ctx.reply("✅ 404 image set successfully!");
    logger.info(`404 image setup completed for user ${ctx.from?.id}`);
  } catch (err) {
    logger.error(`Failed to set 404 image: ${err}`);
    await ctx.reply("❌ Failed to set 404 image. Please try again.");
  }
}
