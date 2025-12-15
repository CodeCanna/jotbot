import { Context, InlineKeyboard } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { Emotion, Entry } from "../types/types.ts";
import { insertEntry } from "../models/entry.ts";
import { telegramDownloadUrl } from "../constants/strings.ts";

export async function new_entry(conversation: Conversation, ctx: Context) {
  // Describe situation
  await ctx.reply("Describe the situation that brought up your thought.");
  const situationCtx = await conversation.waitFor("message:text");

  // Record automatic thoughts
  await ctx.reply(
    `Okay ${ctx.from?.username} describe the thought.  Rate how much you believed it out of 100%.`,
  );
  const automaticThoughtCtx = await conversation.waitFor("message:text");

  // Emoji and emotion descriptor
  await ctx.reply(
    "Send one word describing your emotions, along with an emoji that matches your emotions.",
  );
  const emojiAndEmotionName = await conversation.waitFor("message:text");

  // Describe your feelings
  await ctx.reply(
    "What emotions were you feeling at the time?  How intense were your feelings out of 100%?",
  );
  const emotionDescriptionCtx = await conversation.waitFor("message:text");

  // Store emoji and emotion name
  const emotionNameAndEmoji = emojiAndEmotionName.message.text.split(" ");
  let emotionEmoji: string, emotionName: string;
  if (/\p{Emoji}/u.test(emotionNameAndEmoji[0])) {
    emotionEmoji = emotionNameAndEmoji[0];
    emotionName = emotionNameAndEmoji[1];
  } else {
    emotionEmoji = emotionNameAndEmoji[1];
    emotionName = emotionNameAndEmoji[0];
  }

  // Build emotion object
  const emotion: Emotion = {
    emotionName: emotionName,
    emotionEmoji: emotionEmoji,
    emotionDescription: emotionDescriptionCtx.message.text,
  };

  ctx.reply("Would you like to take a selfie?", {
    reply_markup: new InlineKeyboard().text("✅ Yes", "selfie-yes").text(
      "⛔ No",
      "selfie-no",
    ),
  });

  const selfieCtx = await conversation.waitForCallbackQuery([
    "selfie-yes",
    "selfie-no",
  ]);

  let selfiePath: string | null = "";
  if (selfieCtx.callbackQuery.data === "selfie-yes") {
    try {
      await ctx.reply("Send me a selfie.");
      const selfiePathCtx = await conversation.waitFor("message:photo");

      const tmpFile = await selfiePathCtx.getFile();
      console.log(tmpFile);
      const selfieResponse = await fetch(
        telegramDownloadUrl.replace("<token>", ctx.api.token).replace(
          "<file_path>",
          tmpFile.file_path!,
        ),
      );

      // const selfieResponse = await conversation.external(async () =>
      //   await fetch(
      //     telegramDownloadUrl.replace("<token>", ctx.api.token).replace(
      //       "<file_path>",
      //       tmpFile.file_path!,
      //     ),
      //   )
      // );

      if (selfieResponse.body) {
        console.log("tits");

        await conversation.external(async () => { // User conversation.external
          const fileName = `${ctx.from?.id}_${
            new Date(Date.now()).toLocaleString()
          }.jpg`.replaceAll(" ", "_").replace(",", "").replaceAll("/", "-"); // Build and sanitize selfie file name

          const filePath = `${Deno.cwd()}/assets/selfies/${fileName}`;
          const file = await Deno.open(filePath, {
            write: true,
            create: true,
          });

          console.log(`File: ${file}`);
          selfiePath = await Deno.realPath(filePath);
          await selfieResponse.body!.pipeTo(file.writable);
        });

        await ctx.reply(`Selfie saved successfully!`);
      }
    } catch (err) {
      console.log(`Jotbot Error: Failed to save selfie: ${err}`);
    }
  } else if (selfieCtx.callbackQuery.data === "selfie-no") {
    selfiePath = null;
  } else {
    console.log(
      `Invalid Selection: ${selfieCtx.callbackQuery.data}`,
    );
  }

  const entry: Entry = {
    timestamp: await conversation.external(() => Date.now()),
    userId: ctx.from?.id!,
    emotion: emotion,
    situation: situationCtx.message.text,
    automaticThoughts: automaticThoughtCtx.message.text,
    selfiePath: selfiePath,
  };

  try {
    await conversation.external(() => insertEntry(entry));
  } catch (err) {
    console.log(`Failed to insert Entry: ${err}`);
    return await ctx.reply(`Failed to insert entry: ${err}`);
  }

  return await ctx.reply(
    `Entry added at ${
      new Date(entry.timestamp).toLocaleString()
    }!  Thank you for logging your emotion with me.`,
  );
}
