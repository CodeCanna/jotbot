import { Context, InlineKeyboard } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { insertUser } from "../models/user.ts";
import { User } from "../types/types.ts";
import { dbFile } from "../constants/paths.ts";
import { logger } from "../utils/logger.ts";

function isValidDate(input: string): { isValid: boolean; message?: string } {
  const trimmedInput = input.trim();

  const regex = /^\d{4}\/\d{2}\/\d{2}$/;
  if (!regex.test(trimmedInput)) {
    return { isValid: false, message: "Invalid format. Please use YYYY/MM/DD" };
  }

  const [year, month, day] = trimmedInput.split("/").map(Number);

  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      message: "Invalid date. Please enter a valid date.",
    };
  }

  if (
    date.getFullYear() !== year || date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return { isValid: false, message: "Invalid date. The date doesn't exist." };
  }

  const now = new Date();
  const minDate = new Date(
    now.getFullYear() - 120,
    now.getMonth(),
    now.getDate(),
  );
  const minAgeDate = new Date(
    now.getFullYear() - 13,
    now.getMonth(),
    now.getDate(),
  );

  if (date > now) {
    return { isValid: false, message: "Date cannot be in the future." };
  }

  if (date < minDate) {
    return {
      isValid: false,
      message: "Date cannot be more than 120 years ago.",
    };
  }

  if (date > minAgeDate) {
    return {
      isValid: false,
      message: "You must be at least 13 years old to use this bot.",
    };
  }

  return { isValid: true };
}

export async function register(conversation: Conversation, ctx: Context) {
  if (!ctx.from) {
    await ctx.reply("Error: Unable to identify user.");
    return;
  }
  try {
    let dob;
    try {
      while (true) {
        await ctx.editMessageText(
          `Okay ${ctx.from.username} what is your date of birth? YYYY/MM/DD`,
        );
        const dobCtx = conversation.waitFor("message:text");
        const inputText = (await dobCtx).message.text.trim();
        const validation = isValidDate(inputText);

        if (!validation.isValid) {
          (await dobCtx).reply(`${validation.message} Please try again.`);
        } else {
          dob = new Date(inputText);
          break;
        }
      }
    } catch (err) {
      logger.error(`Error getting DOB for user ${ctx.from.id}: ${err}`);
      await ctx.reply(
        "❌ Sorry, there was an error processing your date of birth. Please try registering again with /start.",
      );
      return; // End conversation gracefully
    }

    const user: User = {
      telegramId: ctx.from.id,
      username: ctx.from.username || "User",
      dob: dob,
      joinedDate: await conversation.external(() => {
        return new Date(Date.now());
      }),
    };

    logger.debug(`Registering new user: ${JSON.stringify(user)}`);
    try {
      insertUser(user, dbFile);
    } catch (err) {
      ctx.reply(`Failed to save user ${user.username}: ${err}`);
      logger.error(`Error inserting user ${user.username}: ${err}`);
    }
    await ctx.reply(
      `Welcome ${user.username}!  You have been successfully registered.  Would you like to start by recording an entry?`,
      { reply_markup: new InlineKeyboard().text("New Entry", "new-entry") },
    );
  } catch (error) {
    logger.error(
      `Error in register conversation for user ${ctx.from?.id}: ${error}`,
    );
    try {
      await ctx.reply(
        "❌ Sorry, there was an error during registration. Please try again with /start.",
      );
    } catch (replyError) {
      logger.error(`Failed to send error message: ${replyError}`);
    }
  }
}
