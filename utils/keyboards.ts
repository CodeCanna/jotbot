import { InlineKeyboard, Keyboard } from "grammy";

export const registerKeyboard = new InlineKeyboard().text(
  "Register",
  "register-new-user",
);

export const deleteAccountConfirmKeyboard: InlineKeyboard = new InlineKeyboard()
  .text("⚠️ Yes ⚠️", "delete-account-yes")
  .text("No", "delete-account-no");

export const viewEntriesKeyboard: InlineKeyboard = new InlineKeyboard()
  .text("⏮️", "previous-entry")
  .text("💣 Delete 💣", "delete-entry")
  .text("⏭️", "next-entry").row()
  .text("✏️Edit Entry✏️", "edit-entry").row()
  .text("Exit", "view-entry-backbutton");

export const mainCustomKeyboard: Keyboard = new Keyboard()
  .text("/new_entry").row()
  .text("/view_entries").row()
  .text("/delete_account")
  .text("/🆘").row()
  .text("/kitties")
  .text("/help")
  .oneTime(true)
  .resized();

export const mainKittyKeyboard: InlineKeyboard = new InlineKeyboard()
  .text("🐱 Random Kitty 🎲", "random-kitty").row()
  .text("Kitty Gif", "kitty-gif")
  .text("Kitty Says", "kitty-says").row()
  .text("Inspirational 🐱", "inspiration-kitty").row()
  .text("Exit", "kitty-exit");
