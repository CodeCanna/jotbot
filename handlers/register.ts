import { Context, InlineKeyboard } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { insertUser } from "../models/user.ts";
import { User } from "../types/types.ts";

export async function register(conversation: Conversation, ctx: Context) {
  console.log("TIts?");
  const user: User = {
    telegramId: 0,
    username: "",
    dob: new Date(),
    joinedDate: await conversation.external(() => {
      return new Date(Date.now());
    }),
  };
  user.telegramId = (await ctx.getAuthor()).user.id;
  await ctx.editMessageText(
    `Okay!  So to confirm, your name is <b><u>${ctx.from?.username}</u></b> correct?`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text("Yes", "name-confirm-yes").text(
        "No",
        "name-confirm-no",
      ),
    },
  );

  const nameCtx = await conversation.waitForCallbackQuery([
    "name-confirm-yes",
    "name-confirm-no",
  ]);

  if (nameCtx.callbackQuery.data === "name-confirm-yes") {
    // Set username
    if (typeof (await ctx.getAuthor()).user.username === "string") {
      user.username = (await ctx.getAuthor()).user.username!;
    } else {
      throw new Error("No username found!");
    }
  } else if (nameCtx.callbackQuery.data === "name-confirm-no") {
    await nameCtx.reply("Okay, what is your name?");
    const nameConfirmCtx = await conversation.waitFor("message:text");
    await nameCtx.reply(`Nice to meet you ${nameConfirmCtx.message.text}!`);
    // Set username
    user.username = nameConfirmCtx.message.text;
  } else {
    await nameCtx.reply(
      `Invalid Entry Detected at name confirmation: ${nameCtx.callbackQuery.data}`,
    );
    throw new Error(
      `Invalid Entry Detected at name confirmation: ${nameCtx.callbackQuery.data}`,
    );
  }

  try {
    while (true) {
      await ctx.editMessageText(
        `Okay ${user.username} what is your date of birth? YYYY/MM/DD`,
      );
      const dobCtx = conversation.waitFor("message:text");
      const dob = new Date((await dobCtx).message.text);

      if (isNaN(dob.getTime())) {
        (await dobCtx).reply("Invalid date entered.  Please try again.");
      } else {
        user.dob = dob;
        break;
      }
    }
  } catch (err) {
    await ctx.reply(`Failed to save birthdate: ${err}`);
    throw new Error(`Failed to save birthdate: ${err}`);
  }

  console.log(user);
  try {
    insertUser(user);
  } catch (err) {
    ctx.reply(`I ran into an error recording user information: ${err}`);
    console.log(`Error inserting user or creating user table: ${err}`);
  }
  ctx.reply(
    `Welcome ${user.username}!  You have been successfully registered.  Would you like to start by recording an entry?`,
    { reply_markup: new InlineKeyboard().text("New Entry", "new-entry") },
  );
}
