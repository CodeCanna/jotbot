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
  //   console.log(await kittyEngine.getRandomCat());
  loop:
  while (true) {
    const kittyMainSelectionCtx = await conversation.waitForCallbackQuery(
      /(random-kitty|specific-kitty|kitty-gif|kitty-says|inspiration-kitty|kitty-exit)/,
    );
    switch (kittyMainSelectionCtx.callbackQuery.data) {
      case ("random-kitty"): {
        console.log("Random Kitty");
        const kitty = await kittyEngine.getRandomKitty();
        await kittyMainSelectionCtx.editMessageMedia(
          InputMediaBuilder.photo(kitty.url),
          {
            reply_markup: mainKittyKeyboard,
          },
        );
        break;
      }
      case ("specific-kitty"): {
        console.log("Specific Kitty");
        await kittyMainSelectionCtx.editMessageText(
          "Give me coma separated tags ex: cute,orange,fat",
        );
        const tagStringCtx = await conversation.waitFor("message:text");
        kittyEngine.tagString = tagStringCtx.message.text;
        const kitty = await kittyEngine.getSpecificKitty();
        tagStringCtx.deleteMessage();
        await kittyMainSelectionCtx.editMessageMedia(
          InputMediaBuilder.photo(kitty.url),
          {
            reply_markup: mainKittyKeyboard,
          },
        );
        break;
      }
      case ("kitty-gif"): {
        console.log("Kitty Gif");
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
        console.log("Kitty Says");
        await kittyMainSelectionCtx.editMessageText(
          "What do you want your kitty to say?",
        );

        const kittySaysCtx = await conversation.waitFor("message:text");
        const kitty = await kittyEngine.getKittySays(kittySaysCtx.message.text);
        kittySaysCtx.deleteMessage();
        await kittyMainSelectionCtx.editMessageMedia(
          InputMediaBuilder.photo(kitty.url),
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
          20,
          "white",
        );
        await kittyMainSelectionCtx.editMessageMedia(
          InputMediaBuilder.photo(kitty.url),
          { reply_markup: mainKittyKeyboard },
        );
        break;
      }
      case ("kitty-exit"): {
        console.log("Kitty Exit");
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
