import { Context } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { deleteAccountConfirmKeyboard } from "../utils/keyboards.ts";
import { deleteUser } from "../models/user.ts";

export async function delete_account(conversation: Conversation, ctx: Context) {
  try {
    await ctx.reply(
      `⚠️ Are you sure you want to <b><u>delete</u></b> your account <b>along with all of your entries</b> ⚠️`,
      { parse_mode: "HTML", reply_markup: deleteAccountConfirmKeyboard },
    );

    const deleteAccountCtx = await conversation.waitForCallbackQuery([
      "delete-account-yes",
      "delete-account-no",
    ]);

    if (deleteAccountCtx.callbackQuery.data === "delete-account-yes") {
      deleteUser(ctx.from?.id!);
    } else if (deleteAccountCtx.callbackQuery.data === "delete-account-no") {
      conversation.halt();
      return await deleteAccountCtx.editMessageText("No changes made!");
    }

    await ctx.reply(`Okay ${ctx.from?.username} your account has been terminated along with all of your entries.  Thanks for trying Jotbot!`);
  } catch (err) {
    console.log(
      `Failed to delete user ${ctx.from?.username}: ${err}`,
    );
  }
}
