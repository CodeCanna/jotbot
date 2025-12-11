import { Context, InlineKeyboard } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { insertUser } from "../models/user.ts";
import { User } from "../types/types.ts";

export async function register(conversation: Conversation, ctx: Context) {
  let dob;
  try {
    while (true) {
      await ctx.editMessageText(
        `Okay ${ctx.from?.username} what is your date of birth? YYYY/MM/DD`,
      );
      const dobCtx = conversation.waitFor("message:text");
      dob = new Date((await dobCtx).message.text);

      if (isNaN(dob.getTime())) {
        (await dobCtx).reply("Invalid date entered.  Please try again.");
      } else {
        break;
      }
    }
  } catch (err) {
    await ctx.reply(`Failed to save birthdate: ${err}`);
    throw new Error(`Failed to save birthdate: ${err}`);
  }

  const user: User = {
    telegramId: ctx.from?.id!,
    username: ctx.from?.username!,
    dob: dob,
    joinedDate: await conversation.external(() => {
      return new Date(Date.now());
    }),
  };

  console.log(user);
  try {
    insertUser(user);
  } catch (err) {
    ctx.reply(`Failed to save user ${user.username}: ${err}`);
    console.log(`Error inserting user ${user.username}: ${err}`);
  }
  ctx.reply(
    `Welcome ${user.username}!  You have been successfully registered.  Would you like to start by recording an entry?`,
    { reply_markup: new InlineKeyboard().text("New Entry", "new-entry") },
  );
}
