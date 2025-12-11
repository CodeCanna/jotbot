import { Context, InlineKeyboard } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { Entry, Mood } from "../types/types.ts";
import { insertEntry } from "../models/entry.ts";
import { telegramDownloadUrl } from "../constants/strings.ts";

export async function new_entry(conversation: Conversation, ctx: Context) {
  // Describe situation
  await ctx.reply("What was happening at the time, and prior to your thought?");
  const situationCtx = await conversation.waitFor("message:text");

  // Record automatic thoughts
  await ctx.reply(
    "Describe the thought.  Rate how much you believed it out of 100%.",
  );
  const automaticThoughtCtx = await conversation.waitFor("message:text");

  // Emoji and mood descriptor
  await ctx.reply(
    "Send one word describing how you feel, along with an emoji that matches how you feel.",
  );
  const emojiAndMoodName = await conversation.waitFor("message:text");

  // Describe your feelings and mood
  await ctx.reply(
    "What was your mood at the time?  How intense were your feelings out of 100%?",
  );
  const moodDescriptionCtx = await conversation.waitFor("message:text");

  // Build entry and mood objects
  const mood: Mood = {
    moodName: "",
    moodEmoji: "",
    moodDescription: moodDescriptionCtx.message.text,
  };

  const moodNameAndEmoji = emojiAndMoodName.message.text.split(" ");

  const emojiRegex = /\p{Emoji}/u;
  if (emojiRegex.test(moodNameAndEmoji[0])) {
    mood.moodEmoji = moodNameAndEmoji[0];
    mood.moodName = moodNameAndEmoji[1];
  } else {
    mood.moodEmoji = moodNameAndEmoji[1];
    mood.moodName = moodNameAndEmoji[0];
  }

  ctx.reply("Would you like to take a selfie?", {
    reply_markup: new InlineKeyboard().text("Yes", "selfie-yes").text(
      "No",
      "selfie-no",
    ),
  });

  const selfieCtx = conversation.waitForCallbackQuery([
    "selfie-yes",
    "selfie-no",
  ]);
  let selfiePath: string | null = "";
  if ((await selfieCtx).callbackQuery.data === "selfie-yes") {
    try {
      await ctx.reply("Send me a selfie.");
      const selfiePathCtx = await conversation.waitFor("message:photo");

      const tmpFile = await selfiePathCtx.getFile();
      const selfieResponse = await fetch(
        telegramDownloadUrl.replace("<token>", ctx.api.token).replace(
          "<file_path>",
          tmpFile.file_path!,
        ),
      );

      if (selfieResponse.body) {
        await conversation.external(async () => {
          const fileName = `${(await selfiePathCtx.getAuthor()).user.id}_${
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

        await selfiePathCtx.reply(`Selfie saved successfully!`);
      }
    } catch (err) {
      console.log(`Jotbot Error: Failed to save selfie: ${err}`);
    }
  } else if ((await selfieCtx).callbackQuery.data === "selfie-no") {
    selfiePath = null;
  } else {
    console.log(
      `Invalid Selection: ${(await selfieCtx).callbackQuery.data}`,
    );
  }

  const entry: Entry = {
    timestamp: Date.now(),
    userId: (await ctx.getAuthor()).user.id!,
    mood: mood,
    situation: situationCtx.message.text,
    automaticThoughts: automaticThoughtCtx.message.text,
    selfiePath: selfiePath,
  };

  console.log(entry);

  try {
    await conversation.external(() => insertEntry(entry));
  } catch (err) {
    console.log(`Failed to insert Entry: ${err}`);
    return await ctx.reply(`Failed to insert entry: ${err}`);
  }
  return await ctx.reply(
    `Entry added at ${
      new Date(entry.timestamp).toLocaleString()
    }!  Thank you for logging your mood with me.`,
  );
}
