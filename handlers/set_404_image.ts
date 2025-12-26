import { Context } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { updateCustom404Image } from "../models/settings.ts";
import { getTelegramDownloadUrl } from "../constants/strings.ts";
import { dbFile } from "../constants/paths.ts";

export async function set_404_image(conversation: Conversation, ctx: Context) {
  await ctx.reply("Please send the image you want to use as your 404 image for entries without selfies.");

  const photoCtx = await conversation.waitFor("message:photo");

  if (!photoCtx.message.photo) {
    await ctx.reply("No photo received. Operation cancelled.");
    return;
  }

  const photo = photoCtx.message.photo[photoCtx.message.photo.length - 1]; // Get largest
  const tmpFile = await ctx.api.getFile(photo.file_id);

  if (tmpFile.file_size && tmpFile.file_size > 5_000_000) { // 5MB limit
    await ctx.reply("Image is too large (max 5MB). Please try a smaller image.");
    return;
  }

  try {
    const baseUrl = (ctx.api as any).options?.apiRoot || "https://api.telegram.org";
    const response = await fetch(
      getTelegramDownloadUrl(baseUrl, ctx.api.token, tmpFile.file_path!),
    );

    if (!response.ok) {
      throw new Error("Failed to download image");
    }

    const fileName = `${ctx.from?.id}_404.jpg`;
    const filePath = `assets/404/${fileName}`;

    const file = await Deno.open(filePath, {
      write: true,
      create: true,
    });

    await response.body!.pipeTo(file.writable);

    // Update settings
    updateCustom404Image(ctx.from!.id, filePath, dbFile);

    await ctx.reply("✅ 404 image set successfully!");
  } catch (err) {
    console.error(`Failed to set 404 image: ${err}`);
    await ctx.reply("❌ Failed to set 404 image. Please try again.");
  }
}