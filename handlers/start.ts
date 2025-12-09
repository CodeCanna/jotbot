import { Context } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { createUserTable } from "../db/migration.ts";
import { insertUser } from "../models/user.ts";
import { User } from "../types/types.ts";

export async function start(conversation: Conversation, ctx: Context) {
  const user: User = {
    telegramId: 0,
    username: "",
    dob: new Date(),
  };
  while (true) {
    user.telegramId = (await ctx.getAuthor()).user.id;
    await ctx.reply(
      `Okay!  So to confirm, your name is <b><u>${
        (await ctx.getAuthor()).user.username
      }</u></b> correct?`,
      { parse_mode: "HTML" },
    );
    const nameCtx = await conversation.waitFor("message:text");

    if (nameCtx.message.text.toLocaleLowerCase() === "yes") {
      // Set username
      if (typeof (await ctx.getAuthor()).user.username === "string") {
        user.username = (await ctx.getAuthor()).user.username!;
        break;
      } else {
        throw new Error("No username found!");
      }
    } else if (nameCtx.message.text.toLocaleLowerCase() === "no") {
      await nameCtx.reply("Okay, what is your name?");
      const nameConfirmCtx = await conversation.waitFor("message:text");
      await nameCtx.reply(`Nice to meet you ${nameConfirmCtx.message.text}!`);
      // Set username
      user.username = nameConfirmCtx.message.text;
      break;
    } else {
      await nameCtx.reply(
        "I'm sorry I didn't understand.  Please type Yes or No.",
      );
    }
  }

  try {
    while (true) {
      await ctx.reply(
        `Okay ${user.username} what is your date of birth? YYYY/MM/DD`,
      );
      const dobCtx = conversation.waitFor("message:text");
      const dob = new Date((await dobCtx).message.text);

      if (isNaN(dob.getTime())) {
        (await dobCtx).reply("Invalid date entered.");
      } else {
        user.dob = dob;
        break;
      }
    }
  } catch (err) {
    await ctx.reply(`I had a hard time getting your birthdate: ${err}`);
  }

  console.log(user);
  try {
    createUserTable();
    insertUser(user);
  } catch (err) {
    ctx.reply(`I ran into an error recording user information: ${err}`);
    console.log(`Error inserting user or creating user table: ${err}`);
  }
}
