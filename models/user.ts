import { DatabaseSync } from "node:sqlite";
import { User } from "../types/types.ts";

export function insertUser(user: User) {
  try {
    const db = new DatabaseSync("db/jotbot.db");
    db.exec("PRAGMA foreign_keys = ON;");
    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");

    db.prepare(`
        INSERT INTO user_db (telegramId, username, dob, joinedDate) VALUES (?, ?, ?, ?);
    `).run(
      user.telegramId,
      user.username,
      user.dob.getTime(),
      user.joinedDate.getTime(),
    );

    db.close();
  } catch (err) {
    console.error(
      `Failed to insert user: ${user.username} into database: ${err}`,
    );
  }
}

export function deleteUser(userTelegramId: number) {
  try {
    const db = new DatabaseSync("db/jotbot.db");
    db.exec("PRAGMA foreign_keys = ON;");
    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");

    db.prepare(`DELETE FROM user_db WHERE telegramId = ${userTelegramId};`)
      .run();

    db.close();
  } catch (err) {
    console.error(
      `Failed to delete user ${userTelegramId} from database: ${err}`,
    );
  }
}

export function userExists(userTelegramId: number): boolean {
  let ue: number = 0;
  try {
    const db = new DatabaseSync("db/jotbot.db");
    db.exec("PRAGMA foreign_keys = ON;");
    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");

    const user = db.prepare(
      `SELECT EXISTS(SELECT 1 FROM user_db WHERE telegramId = '${userTelegramId}')`,
    ).get();
    for (const u in user) {
      ue = Number(user[u]);
    }
    db.close();
  } catch (err) {
    console.error(
      `Failed to check if user ${userTelegramId} exists in database: ${err}`,
    );
  }

  if (ue === 1) {
    return true;
  }
  return false;
}
