import { Context, InlineKeyboard } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { Entry, Mood } from "../types/types.ts";
import { Keyboard } from "grammy";
import { insertEntry } from "../models/entry.ts";
import { telegramDownloadUrl } from "../constants/strings.ts";
import { open } from "node:fs";
import { fileURLToPath } from "node:url";

export async function record(conversation: Conversation, ctx: Context) {
  const moodKeyboard = new Keyboard()
    .text("😊").row()
    .text("🙂").row()
    .text("😐").row()
    .text("🙁").row()
    .text("☹️").oneTime();
  // Assess mood
  await ctx.reply("Hi!  I would love to help you record your mood 😀");
  await ctx.reply("Let's start by recording your general mood.", {
    reply_markup: moodKeyboard,
  });
  const usersMood = await conversation.waitFor("message:text");
  const mood: Mood = {
    moodName: "",
    moodEmoji: "",
    moodDescription: "",
  };

  switch (usersMood.message.text) {
    case ("😊"): {
      console.log("You pressed very happy");
      await ctx.reply(
        "Wonderful!  I'm glad you are very happy today!  Please give me a description of your general mood today.",
      );
      const moodDescription = await conversation.waitFor("message:text");

      mood.moodName = "Very Happy";
      mood.moodEmoji = "😊";
      mood.moodDescription = moodDescription.message.text;

      console.log(mood);
      break;
    }
    case ("🙂"): {
      console.log("You pressed happy");
      await ctx.reply(
        "Glad to hear you are doing well today! Please give me a description of your general mood today.",
      );
      const moodDescription = await conversation.waitFor("message:text");
      mood.moodName = "Happy";
      mood.moodEmoji = "🙂";
      mood.moodDescription = moodDescription.message.text;
      break;
    }
    case ("😐"): {
      console.log("You pressed meh");
      await ctx.reply(
        "Please give me a description of your general mood today.",
      );
      const moodDescription = await conversation.waitFor("message:text");
      mood.moodName = "Meh";
      mood.moodEmoji = "😐";
      mood.moodDescription = moodDescription.message.text;
      break;
    }
    case ("🙁"): {
      console.log("You pressed sad");
      await ctx.reply(
        "We all have those bad days, Please give me a description of your general mood today.",
      );
      const moodDescription = await conversation.waitFor("message:text");
      mood.moodName = "Sad";
      mood.moodEmoji = "🙁";
      mood.moodDescription = moodDescription.message.text;
      break;
    }
    case ("☹️"): {
      console.log("You pressed very sad");
      await ctx.reply(
        "Awwwwww I'm so sorry to hear that you are not okay! Please give me a description of your general mood today.",
      );
      const moodDescription = await conversation.waitFor("message:text");
      mood.moodName = "Very Sad";
      mood.moodEmoji = "☹️";
      mood.moodDescription = moodDescription.message.text;
      break;
    }
    default: {
      await ctx.reply("Invalid option detected!");
    }
  }
  await ctx.reply(
    "Okay! Now why don't you share more about the situation you were in when you felt this way.",
  );
  const situationCtx = await conversation.waitFor("message:text");
  await situationCtx.reply(
    "Okay now tell me more about the thoughts you were having in these moments.",
  );
  const thoughtsCtx = await conversation.waitFor("message:text");

  await thoughtsCtx.reply(
    "Would you like to add a selfie to document your facial expression while you are feeling this way?",
  );

  const selfieCtx = await conversation.waitFor("message:text");

  let selfiePath: string | null = "";
  while (true) {
    if (selfieCtx.message.text.toLocaleLowerCase() === "yes") {
      await selfieCtx.reply(`Send me a selfie!`);
      const selfiePathCtx = await conversation.waitFor("message:photo");
      const tmpFile = await selfiePathCtx.getFile();
      const selfieResponse = await fetch(
        telegramDownloadUrl.replace("<token>", ctx.api.token).replace(
          "<file_path>",
          tmpFile.file_path!,
        ),
      );

      if (selfieResponse.body) {
        try {
          const fileName = `${
            (await selfiePathCtx.getAuthor()).user.id
          }-${new Date(Date.now()).toLocaleString()}.jpg`.replaceAll(" ", "_").replace(",", "").replaceAll("/", "-");

          const filePath = `${Deno.cwd()}/assets/selfies/${fileName}`;

          const file = await Deno.open(filePath, { write: true, create: true });

          selfiePath = await Deno.realPath(
            filePath,
          );

          console.log(selfiePath);

          await selfieResponse.body.pipeTo(file.writable);
          await selfiePathCtx.reply(`Selfie saved successfully!`);
        } catch (err) {
          console.log(`Failed to safe selfie: ${err}`);
          await selfiePathCtx.reply(`Failed to save selfie: ${err}`);
        }
      }

      break;
    } else if (selfieCtx.message.text.toLocaleLowerCase() === "no") {
      await selfieCtx.reply("Okay");
      break;
    } else {
      await selfieCtx.reply("I didn't understand please type Yes or No");
    }
  }
  if (selfiePath === "") selfiePath = null;
  const entry: Entry = {
    timestamp: Date.now(),
    userId: (await ctx.getAuthor()).user.id!,
    mood: mood,
    situation: situationCtx.message.text,
    automaticThoughts: thoughtsCtx.message.text,
    selfiePath: selfiePath,
  };

  console.log(entry);

  try {
    insertEntry(entry);
  } catch (err) {
    console.log(`Failed to insert Entry: ${err}`);
    return await ctx.reply(`Failed to insert entry: ${err}`);
  }
  return await ctx.reply(
    `Entry added at ${
      new Date(entry.timestamp).toLocaleString()
    }!  Thank you for logging your mood wit me.`,
  );
}
