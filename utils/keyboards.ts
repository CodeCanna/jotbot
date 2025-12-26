import { InlineKeyboard, Keyboard } from "grammy";

export const registerKeyboard = new InlineKeyboard().text(
  "Register",
  "register-new-user",
);

export const deleteAccountConfirmKeyboard: InlineKeyboard = new InlineKeyboard()
  .text("⚠️ Yes ⚠️", "delete-account-yes")
  .text("No", "delete-account-no");

export const viewEntriesKeyboard: InlineKeyboard = new InlineKeyboard()
  .text("⬅️", "previous-entry")
  .text("💣 Delete 💣", "delete-entry")
  .text("➡️", "next-entry").row()
  .text("✏️Edit Entry✏️", "edit-entry").row()
  .text("🛑Exit🛑", "view-entry-backbutton");

export const mainCustomKeyboard: Keyboard = new Keyboard()
  .text("/new_entry").row()
  .text("/view_entries").row()
  .text("/new_journal_entry").row()
  .text("/view_journal_entries").row()
  .text("/snapshot")
  .text("/kitties").row()
  .text("/am_i_depressed").row()
  .text("/am_i_anxious").row()
  .text("/settings")
  .text("/help")
  .text("/🆘").row()
  .text("/delete_account")
  .oneTime(true)
  .resized();

export const mainKittyKeyboard: InlineKeyboard = new InlineKeyboard()
  .text("🐱 Random Kitty 🎲", "random-kitty").row()
  .text("Kitty Gif", "kitty-gif")
  .text("Kitty Says", "kitty-says").row()
  .text("Inspirational 🐱", "inspiration-kitty").row()
  .text("Exit", "kitty-exit");

export const questionaireKeyboard: InlineKeyboard = new InlineKeyboard()
  .text("Not at all", "not-at-all").row()
  .text("Several days", "several-days").row()
  .text("More than half the days", "more-than-half-the-days").row()
  .text("Nearly every day", "nearly-every-day");

export const keyboardFinal: InlineKeyboard = new InlineKeyboard()
  .text("Not difficult at all").row()
  .text("Somewhat difficult").row()
  .text("Very difficult").row()
  .text("Extremely difficult");

export const settingsKeyboard: InlineKeyboard = new InlineKeyboard()
  .text("Save Mental Health Scores", "smhs").row()
  .text("Set 404 Image", "set-404-image").row()
  .text("Back", "settings-back");
