import { Context } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { getEntriesByUserId } from "../models/entry.ts";
import { Entry } from "../types/types.ts";

export async function view_entries(conversation: Conversation, ctx: Context) {
    // const entriesQueryResults = getEntriesByUserId(ctx.from?.id!);

    // const entries: Entry[] = [];
    // for (let i = 0; i < entriesQueryResults.length; i++) {
    //     const entry: Entry = {
    //         id: entriesQueryResults[i].id!,

    //     }
    // }
}