import { Context, InputMediaBuilder } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { KittyEngine } from "../utils/KittyEngine.ts";
import { mainKittyKeyboard } from "../utils/keyboards.ts";
import { quotesApiBaseUrl } from "../constants/strings.ts";

export async function kitties(conversation: Conversation, ctx: Context) {
  const kittyEngine = new KittyEngine();
  await ctx.reply("Let the kitties begin!", {
    reply_markup: mainKittyKeyboard,
  });

  loop:
  while (true) {
    const kittyMainSelectionCtx = await conversation.waitForCallbackQuery(
      /(random-kitty|kitty-gif|kitty-says|inspiration-kitty|kitty-exit)/,
    );
    switch (kittyMainSelectionCtx.callbackQuery.data) {
      case ("random-kitty"): {
        const kitty = await kittyEngine.getRandomKitty();
        await kittyMainSelectionCtx.editMessageMedia(
          InputMediaBuilder.photo(kitty.url),
          {
            reply_markup: mainKittyKeyboard,
          },
        );
        break;
      }
      case ("kitty-gif"): {
        const kitty = await kittyEngine.getRandomKittyGif();
        await kittyMainSelectionCtx.editMessageMedia(
          InputMediaBuilder.animation(kitty.url),
          {
            reply_markup: mainKittyKeyboard,
          },
        );
        break;
      }
      case ("kitty-says"): {
        await kittyMainSelectionCtx.deleteMessage();
        await kittyMainSelectionCtx.api.sendMessage(
          kittyMainSelectionCtx.chatId!,
          "What would you like your kitty to say?",
        );

        const kittySaysCtx = await conversation.waitFor("message:text");
        const kitty = await kittyEngine.getKittySays(kittySaysCtx.message.text);
        await kittyMainSelectionCtx.api.sendPhoto(
          kittyMainSelectionCtx.chatId!,
          kitty.url,
          { reply_markup: mainKittyKeyboard },
        );
        break;
      }
      case ("inspiration-kitty"): {
        const iqResponse = await fetch(quotesApiBaseUrl);
        const iqJson = await iqResponse.json();
        const quote = iqJson[0].q;

        const kitty = await kittyEngine.getCustomizedKittySays(
          quote,
          25,
          "white",
        );
        await kittyMainSelectionCtx.editMessageMedia(
          InputMediaBuilder.photo(kitty.url),
          { reply_markup: mainKittyKeyboard },
        );
        break;
      }
      case ("kitty-exit"): {
        await kittyMainSelectionCtx.deleteMessage();
        await conversation.halt();
        break loop;
      }
      default: {
        throw new Error(
          `JotBot Error: Invalid Selection in kitty main menu selection: ${kittyMainSelectionCtx.callbackQuery.data} is not a valid selection`,
        );
      }
    }
  }
}
