import { Conversation } from "@grammyjs/conversations";
import { Context, InlineKeyboard } from "grammy";
import { gad7Questions } from "../constants/strings.ts";
import { keyboardFinal, questionnaireKeyboard } from "../utils/keyboards.ts";
import {
  finalCallBackQueries,
  questionCallBackQueries,
} from "../constants/strings.ts";
import { GAD7Score } from "../types/types.ts";
import { calcGad7Score } from "../utils/misc.ts";
import { getSettingsById } from "../models/settings.ts";
import { userExists } from "../models/user.ts";
import { dbFile } from "../constants/paths.ts";
import { insertGadScore } from "../models/gad7_score.ts";

export async function gad7_assessment(
  conversation: Conversation,
  ctx: Context,
) {
  if (!ctx.from) {
    await ctx.reply("Error: Unable to identify user.");
    return;
  }
  if (!ctx.chatId) {
    await ctx.reply("Error: Unable to identify chat.");
    return;
  }
  const ctxMsg = await ctx.api.sendMessage(
    ctx.chatId,
    `Hello ${ctx.from.username}, this is the <b><a href="https://en.wikipedia.org/wiki/GAD-7">Generalized Anxiety Disorder-7</a> (GAD-7)</b> this test was developed by a team of highly trained mental health professionals

With that said <b>THIS TEST DOES NOT REPLACE ACTUAL MENTAL HEALTH HELP!</b>  If are in serious need of mental health help you should <b>seek help immediately</b>!

<b>Run /sos to bring up a list of resources that might be able to help</b>

<a href="https://adaa.org/sites/default/files/GAD-7_Anxiety-updated_0.pdf">Click here</a> to see the GAD-7 questionnaire itself, this is where the questions are coming from.

Do you understand that this test is a simple way to help you gauge your anxiety for your own reference, and is in no way <b><u>ACTUAL</u></b> mental health services?
    `,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text("Yes", "gad7-disclaimer-yes")
        .text("No", "gad7-disclaimer-no"),
    },
  );

  const phq9DisclaimerCtx = await conversation.waitForCallbackQuery([
    "gad7-disclaimer-yes",
    "gad7-disclaimer-no",
  ]);

  if (phq9DisclaimerCtx.callbackQuery.data === "phq9-disclaimer-no") {
    return await ctx.api.editMessageText(
      ctx.chatId!,
      ctxMsg.message_id,
      "No problem!  Thanks for checking out the GAD-7 portion of the bot.",
    );
  }

  await ctx.api.editMessageText(
    ctx.chatId!,
    ctxMsg.message_id,
    `Okay ${ctx.from.username}, let's begin.  Over the <b><u>last 2 weeks</u></b> how often have you been bother by any of the following problems?`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text("Begin", "gad7-begin"),
    },
  );

  const _gad7BeginCtx = await conversation.waitForCallbackQuery("gad7-begin");
  let gad7Ctx;
  let anxietyScore = 0;

  // Questions
  for (const question in gad7Questions) {
    await ctx.api.editMessageText(
      ctx.chatId!,
      ctxMsg.message_id,
      `<b>${Number(question) + 1}.</b> ${gad7Questions[question]}`,
      { reply_markup: questionnaireKeyboard, parse_mode: "HTML" },
    );
    gad7Ctx = await conversation.waitForCallbackQuery(questionCallBackQueries);
    switch (gad7Ctx.callbackQuery.data) {
      case "not-at-all": {
        // No need to add 0
        break;
      }
      case "several-days": {
        anxietyScore += 1;
        break;
      }
      case "more-than-half-the-days": {
        anxietyScore += 2;
        break;
      }
      case "nearly-every-day": {
        anxietyScore += 3;
        break;
      }
    }
  }

  await ctx.api.editMessageText(
    ctx.chatId!,
    ctxMsg.message_id,
    "If you checked of <u>any</u> problems, how <u>difficult</u> have these problems made it for you to do you work, take care of things at home, or get along with other people?",
    { reply_markup: keyboardFinal, parse_mode: "HTML" },
  );

  const gad7FinalCtx = await conversation.waitForCallbackQuery(
    finalCallBackQueries,
  );

  const impactQestionAnswer = gad7FinalCtx.callbackQuery.data;
  const gad7Score: GAD7Score = calcGad7Score(
    anxietyScore,
    ctx.from.id,
    impactQestionAnswer,
  );

  await ctx.api.editMessageText(
    ctx.chatId,
    ctxMsg.message_id,
    `<b>GAD-7 Score:</b> ${gad7Score.score}
<b>Anxiety Severity:</b> ${gad7Score.severity}

Dealing with this level of anxiety is making your life ${gad7Score.impactQuestionAnswer}

${gad7Score.action}`,
    { parse_mode: "HTML" },
  );

  if (userExists(ctx.from.id, dbFile)) {
    const settings = getSettingsById(ctx.from.id, dbFile);

    if (settings?.storeMentalHealthInfo) {
      try {
        insertGadScore(gad7Score, dbFile);
        await ctx.reply("Score saved!");
      } catch (err) {
        throw err;
      }
    } else {
      await ctx.reply("Scores not saved.");
    }
  } else {
    await ctx.reply(
      "It looks like you haven't registered, you can register by running /register to store you scores and keep track of your mental health.",
    );
  }
}
