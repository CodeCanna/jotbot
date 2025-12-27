import { Context } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { deleteAccountConfirmKeyboard } from "../utils/keyboards.ts";
import { deleteUser } from "../models/user.ts";
import { dbFile } from "../constants/paths.ts";
import { logger } from "../utils/logger.ts";

export async function delete_account(conversation: Conversation, ctx: Context) {
  if (!ctx.from) {
    await ctx.reply("Error: Unable to identify user.");
    return;
  }
  try {
    await ctx.reply(
      `⚠️ Are you sure you want to <b><u>delete</u></b> your account <b>along with all of your data</b>? ⚠️`,
      { parse_mode: "HTML", reply_markup: deleteAccountConfirmKeyboard },
    );

    const deleteAccountCtx = await conversation.waitForCallbackQuery([
      "delete-account-yes",
      "delete-account-no",
    ]);

    if (deleteAccountCtx.callbackQuery.data === "delete-account-yes") {
      await conversation.external(() => deleteUser(ctx.from.id, dbFile));
    } else if (deleteAccountCtx.callbackQuery.data === "delete-account-no") {
      conversation.halt();
      return await deleteAccountCtx.editMessageText("No changes made!");
    }
    await conversation.halt();
    return await ctx.editMessageText(
      `Okay ${ctx.from.username} your account has been terminated along with all of your entries.  Thanks for trying Jotbot!`,
    );
  } catch (err) {
    logger.error(
      `Failed to delete user ${ctx.from.username}: ${err}`,
    );
    return await ctx.editMessageText(
      `Failed to delete user ${ctx.from.username}: ${err}`,
    );
  }
}
