import { Conversation } from "@grammyjs/conversations";
import { Context, InlineKeyboard } from "grammy";

export async function view_journal_entries(conversation: Conversation, ctx: Context) {
    await ctx.reply('Buttons!', {reply_markup: new InlineKeyboard().text("Add beans")});

    const otherCtx = await conversation.wait();
    await ctx.reply("Tits");
}