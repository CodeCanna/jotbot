import { Context, InlineKeyboard } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { keyboardFinal, questionnaireKeyboard } from "../utils/keyboards.ts";
import { phq9Questions } from "../constants/strings.ts";
import { PHQ9Score } from "../types/types.ts";
import { calcPhq9Score } from "../utils/misc.ts";
import {
  finalCallBackQueries,
  questionCallBackQueries,
} from "../constants/strings.ts";
import { insertPhqScore } from "../models/phq9_score.ts";
import { dbFile } from "../constants/paths.ts";
import { getSettingsById } from "../models/settings.ts";
import { userExists } from "../models/user.ts";

export async function phq9_assessment(
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
    `Hello ${ctx.from.username}, this is the <b><a href="https://en.wikipedia.org/wiki/PHQ-9">Patient Health Questionaire-9</a> (PHQ-9)</b> this test was developed by a team of highly trained mental health professionals

With that said <b>THIS TEST DOES NOT REPLACE ACTUAL MENTAL HEALTH HELP!</b>  If are in serious need of mental health help you should <b>seek help immediately</b>!

<b>Run /sos to bring up a list of resources that might be able to help</b>

<a href="https://www.apa.org/depression-guideline/patient-health-questionnaire.pdf">Click here</a> to see the PHQ-9 questionnaire itself, this is where the questions are coming from.

Do you understand that this test is a simple way to help you gauge your depression for your own reference, and is in no way <b><u>ACTUAL</u></b> mental health services?
    `,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text("Yes", "phq9-disclaimer-yes")
        .text("No", "phq9-disclaimer-no"),
    },
  );

  const phq9DisclaimerCtx = await conversation.waitForCallbackQuery([
    "phq9-disclaimer-yes",
    "phq9-disclaimer-no",
  ]);

  if (phq9DisclaimerCtx.callbackQuery.data === "phq9-disclaimer-no") {
    return await ctx.api.editMessageText(
      ctx.chatId,
      ctxMsg.message_id,
      "No problem!  Thanks for checking out the phq\-9 portion of the bot.",
    );
  }

  await ctx.api.editMessageText(
    ctx.chatId,
    ctxMsg.message_id,
    `Okay ${ctx.from.username}, let's begin.  Over the <b><u>last 2 weeks</u></b> how often have you been bother by any of the following problems?`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text("Begin", "phq9-begin"),
    },
  );

  const _phq9BeginCtx = await conversation.waitForCallbackQuery("phq9-begin");
  let phq9Ctx;
  let depressionScore = 0;

  // Questions
  for (const question in phq9Questions) {
    await ctx.api.editMessageText(
      ctx.chatId!,
      ctxMsg.message_id,
      phq9Questions[question],
      { reply_markup: questionnaireKeyboard, parse_mode: "HTML" },
    );
    phq9Ctx = await conversation.waitForCallbackQuery(questionCallBackQueries);
    switch (phq9Ctx.callbackQuery.data) {
      case "not-at-all": {
        // No need to add 0
        break;
      }
      case "several-days": {
        depressionScore += 1;
        break;
      }
      case "more-than-half-the-days": {
        depressionScore += 2;
        break;
      }
      case "nearly-every-day": {
        depressionScore += 3;
        break;
      }
    }
  }

  await ctx.api.editMessageText(
    ctx.chatId,
    ctxMsg.message_id,
    "If you checked of <u>any</u> problems, how <u>difficult</u> have these problems made it for you to do you work, take care of things at home, or get along with other people?",
    { reply_markup: keyboardFinal, parse_mode: "HTML" },
  );

  const phq9FinalCtx = await conversation.waitForCallbackQuery(
    finalCallBackQueries,
  );
  const impactQestionAnswer = phq9FinalCtx.callbackQuery.data;
  const phq9Score: PHQ9Score = calcPhq9Score(
    depressionScore,
    ctx.from.id,
    impactQestionAnswer,
  );

  await ctx.api.editMessageText(
    ctx.chatId,
    ctxMsg.message_id,
    `<b>PHQ-9 Score:</b> ${phq9Score.score}
<b>Depression Severity:</b> ${phq9Score.severity}

Dealing with this level of depression is making your life ${phq9Score.impactQuestionAnswer}

${phq9Score.action}`,
    { parse_mode: "HTML" },
  );

  if (userExists(ctx.from.id, dbFile)) {
    const settings = getSettingsById(ctx.from.id, dbFile);

    if (settings?.storeMentalHealthInfo) {
      try {
        phq9Score.id = ctx.from.id;
        insertPhqScore(phq9Score, dbFile);
        await ctx.reply("Score saved!");
      } catch (err) {
        await ctx.reply(`Failed to save score: ${err}`);
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
