import { Context } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { updateCustom404Image } from "../models/settings.ts";
import { getTelegramDownloadUrl } from "../constants/strings.ts";
import { dbFile } from "../constants/paths.ts";

export async function set_404_image(conversation: Conversation, ctx: Context) {
  console.log(`Starting 404 image setup for user ${ctx.from?.id}`);

  await ctx.reply(
    "🖼️ <b>Set Custom 404 Image</b>\n\nSend me an image that will be shown when viewing journal entries that don't have selfies.\n\n<i>This image will be displayed as a placeholder for entries without photos.</i>\n\nSend the image now:",
    { parse_mode: "HTML" },
  );

  console.log(`Waiting for photo from user ${ctx.from?.id}`);
  const photoCtx = await conversation.waitFor("message:photo");
  console.log(`Received photo message: ${!!photoCtx.message.photo}`);

  if (!photoCtx.message.photo) {
    console.log(`No photo in message from user ${ctx.from?.id}`);
    await ctx.reply("No photo received. Operation cancelled.");
    return;
  }

  const photo = photoCtx.message.photo[photoCtx.message.photo.length - 1]; // Get largest
  console.log(`Selected largest photo: file_id=${photo.file_id}, size=${photo.file_size}`);

  console.log(`Getting file info for ${photo.file_id}`);
  let tmpFile;
  try {
    tmpFile = await ctx.api.getFile(photo.file_id);
    console.log(`File info received: path=${tmpFile.file_path}, size=${tmpFile.file_size}`);
  } catch (error) {
    console.error(`Failed to get file info: ${error}`);
    await ctx.reply("❌ Failed to process the image. Please try uploading again.");
    return;
  }

  if (tmpFile.file_size && tmpFile.file_size > 5_000_000) { // 5MB limit
    console.log(`File too large: ${tmpFile.file_size} bytes`);
    await ctx.reply("Image is too large (max 5MB). Please try a smaller image.");
    return;
  }

  // Extract relative file path from absolute server path
  // Telegram API expects paths like "photos/file_0.jpg", not "/var/lib/telegram-bot-api/.../photos/file_0.jpg"
  let relativeFilePath = tmpFile.file_path!;
  if (relativeFilePath.includes('/photos/') || relativeFilePath.includes('/documents/') || relativeFilePath.includes('/videos/')) {
    // Find the last occurrence of known Telegram file directories
    const photoIndex = relativeFilePath.lastIndexOf('/photos/');
    const docIndex = relativeFilePath.lastIndexOf('/documents/');
    const videoIndex = relativeFilePath.lastIndexOf('/videos/');

    const lastIndex = Math.max(photoIndex, docIndex, videoIndex);
    if (lastIndex !== -1) {
      relativeFilePath = relativeFilePath.substring(lastIndex + 1); // Remove the leading slash
    }
  }

  console.log(`Using relative file path: ${relativeFilePath}`);

  // Retry mechanism for file operations
  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    try {
      const baseUrl = (ctx.api as any).options?.apiRoot || "https://api.telegram.org";
      const downloadUrl = getTelegramDownloadUrl(baseUrl, ctx.api.token, relativeFilePath);

      console.log(`Attempt ${retryCount + 1}/${maxRetries + 1} - Base URL: ${baseUrl}`);
      console.log(`Download URL: ${downloadUrl}`);

      console.log(`Starting fetch request...`);
      const response = await fetch(downloadUrl, {
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      console.log(`Fetch response: status=${response.status}, ok=${response.ok}`);

      let finalResponse = response;

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error text');
        console.error(`Download failed: status=${response.status}, body="${errorText}"`);

        // If custom API fails and we haven't exhausted retries, try official API as fallback
        if (baseUrl !== "https://api.telegram.org" && retryCount < maxRetries) {
          console.log(`Custom API failed, trying official Telegram API as fallback...`);
          const officialUrl = getTelegramDownloadUrl("https://api.telegram.org", ctx.api.token, relativeFilePath);
          console.log(`Official URL: ${officialUrl}`);

          try {
            const officialResponse = await fetch(officialUrl, {
              signal: AbortSignal.timeout(30000),
            });

            console.log(`Official response: status=${officialResponse.status}, ok=${officialResponse.ok}`);

            if (officialResponse.ok) {
              console.log(`Official API success, using that instead`);
              finalResponse = officialResponse;
            } else {
              const officialError = await officialResponse.text().catch(() => 'No error text');
              console.error(`Official API also failed: status=${officialResponse.status}, body="${officialError}"`);
              if (retryCount === maxRetries) {
                throw new Error(`Both APIs failed. Official: HTTP ${officialResponse.status}`);
              }
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
              continue;
            }
          } catch (officialError) {
            console.error(`Official API network error: ${officialError}`);
            if (retryCount === maxRetries) {
              throw new Error(`Network error on official API: ${officialError}`);
            }
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        } else {
          if (retryCount === maxRetries) {
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }

      const fileName = `${ctx.from?.id}_404.jpg`;
      const filePath = `assets/404/${fileName}`;
      console.log(`Saving to: ${filePath}`);

      try {
        const file = await Deno.open(filePath, {
          write: true,
          create: true,
        });

        console.log(`Starting file download...`);
        await finalResponse.body!.pipeTo(file.writable);
        console.log(`File download completed`);
      } catch (fileError) {
        console.error(`File operation error: ${fileError}`);
        throw new Error(`Failed to save file: ${fileError}`);
      }

      // Update settings
      console.log(`Updating database settings`);
      updateCustom404Image(ctx.from!.id, filePath, dbFile);
      console.log(`Settings updated successfully`);

      await ctx.reply("✅ 404 image set successfully!");
      console.log(`404 image setup completed for user ${ctx.from?.id}`);
      return; // Success, exit the function

    } catch (err) {
      console.error(`Attempt ${retryCount + 1} failed: ${err}`);

      if (retryCount === maxRetries) {
        console.error(`All ${maxRetries + 1} attempts failed`);
        await ctx.reply("❌ Failed to set 404 image after multiple attempts. Please try again later.");
        return;
      }

      retryCount++;
      console.log(`Retrying in 2 seconds... (attempt ${retryCount + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
    }
  }
}