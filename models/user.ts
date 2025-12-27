import { User } from "../types/types.ts";
import { PathLike } from "node:fs";
import { withDB } from "../utils/dbHelper.ts";
import { logger } from "../utils/logger.ts";

/**
 * @param user
 * @param dbPath
 * @returns
 */
export function insertUser(user: User, dbPath: PathLike) {
  return withDB(dbPath, (db) => {
    const queryResult = db.prepare(
      `INSERT INTO user_db (telegramId, username, dob, joinedDate) VALUES (?, ?, ?, ?);`,
    ).run(
      user.telegramId,
      user.username,
      user.dob.getTime(),
      user.joinedDate.getTime(),
    );

    if (queryResult.changes === 0) {
      throw new Error(`Insert failed: no changes made`);
    }

    return queryResult;
  });
}

/**
 * @param userTelegramId
 * @param dbFile
 */
export function deleteUser(userTelegramId: number, dbFile: PathLike) {
  return withDB(dbFile, (db) => {
    const queryResult = db.prepare(
      `DELETE FROM user_db WHERE telegramId = ?;`,
    ).run(userTelegramId);

    if (queryResult.changes === 0) {
      logger.warn(`No user found with ID ${userTelegramId} to delete`);
    }

    return queryResult;
  });
}

/**
 * @param userTelegramId
 * @param dbFile
 * @returns
 */
export function userExists(userTelegramId: number, dbFile: PathLike): boolean {
  return withDB(dbFile, (db) => {
    const result = db.prepare(
      `SELECT COUNT(*) as count FROM user_db WHERE telegramId = ?`,
    ).get(userTelegramId) as { count: number };
    return result.count > 0;
  });
}
