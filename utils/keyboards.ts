import { InlineKeyboard, Keyboard } from "grammy";
import { Key } from "node:readline";

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
  .text("🔙", "view-entry-backbutton");

export const mainCustomKeyboard: Keyboard = new Keyboard()
  .text("/new_entry").row()
  .text("/view_entries").row()
  .text("/delete_account")
  .text("/🆘").row()
  .text("/help")
  .resized();

export const viewEntriesKeyboardButtons = [
  ["Prev", "previous-entry"],
  ["Delete", "delete-entry"],
  ["Next", "next-entry"],
  ["Back", "view-entry-backbutton"],
];
