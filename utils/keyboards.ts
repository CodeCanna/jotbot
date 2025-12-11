import { InlineKeyboard, Keyboard } from "grammy";

export const registerKeyboard = new InlineKeyboard().text(
  "Register",
  "register-new-user",
);

export const deleteAccountConfirmKeyboard: InlineKeyboard = new InlineKeyboard()
  .text("Yes", "delete-account-yes")
  .text("No", "delete-account-no");
