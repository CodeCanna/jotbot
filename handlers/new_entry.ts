import { Context, InlineKeyboard } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { Emotion, Entry } from "../types/types.ts";
import { insertEntry } from "../models/entry.ts";
import { telegramDownloadUrl } from "../constants/strings.ts";
import { dbFile } from "../constants/paths.ts";

export async function new_entry(conversation: Conversation, ctx: Context) {
  // Describe situation
  await ctx.api.sendMessage(
    ctx.chatId!,
    "📝 <b>Step 1: Describe the Situation</b>\n\nDescribe the situation that brought up your thought.\n\n<i>Example: \"I was at work and my boss criticized my presentation.\"</i>",
    { parse_mode: "HTML" },
  );
  const situationCtx = await conversation.waitFor("message:text");

  // Record automatic thoughts
  await ctx.reply(
    `🧠 <b>Step 2: Your Automatic Thought</b>\n\nDescribe the thought that came to mind. Then rate how much you believed it (0-100%).\n\n<i>Example: \"I'm terrible at my job. Belief: 85%\"</i>`,
    { parse_mode: "HTML" },
  );
  const automaticThoughtCtx = await conversation.waitFor("message:text");

  // Emoji and emotion descriptor
  await ctx.reply(
    "😊 <b>Step 3: Your Emotion</b>\n\nSend one word describing your emotion, followed by a matching emoji.\n\n<i>Example: \"anxious 😰\" or \"sad 😢\"</i>\n\nThe emoji should represent how you felt.",
    { parse_mode: "HTML" },
  );
  const emojiAndEmotionName = await conversation.waitFor("message:text");

  // Describe your feelings
  await ctx.reply(
    "💭 <b>Step 4: Emotion Description</b>\n\nDescribe the emotions you were feeling and how intense they were (0-100%).\n\n<i>Example: \"I felt very anxious and overwhelmed. Intensity: 90%\"</i>",
    { parse_mode: "HTML" },
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

  const askSelfieMsg = await ctx.reply("Would you like to take a selfie?", {
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
      await ctx.api.editMessageText(
        ctx.chatId!,
        askSelfieMsg.message_id,
        "Send me a selfie.",
      );
      const selfiePathCtx = await conversation.waitFor("message:photo");

      const tmpFile = await selfiePathCtx.getFile();
      console.log(selfiePathCtx.message.c);
      const selfieResponse = await fetch(
        telegramDownloadUrl.replace("<token>", ctx.api.token).replace(
          "<file_path>",
          tmpFile.file_path!,
        ),
      );
      if (selfieResponse.body) {
        await conversation.external(async () => { // use conversation.external
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
    await conversation.external(() => insertEntry(entry, dbFile));
  } catch (err) {
    console.log(`Failed to insert Entry: ${err}`);
    return await ctx.reply(`Failed to insert entry: ${err}`);
  }

  return await ctx.reply(
    `Entry added at ${
      new Date(entry.timestamp!).toLocaleString()
    }!  Thank you for logging your emotion with me.`,
  );
}
