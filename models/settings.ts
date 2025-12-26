import { PathLike } from "node:fs";
import { Settings } from "../types/types.ts";
import { withDB } from "../utils/dbHelper.ts";

/**
 * @param userId
 * @param dbFile
 * @returns
 */
export function insertSettings(userId: number, dbFile: PathLike) {
  return withDB(dbFile, (db) => {
    const queryResult = db.prepare(
      `INSERT INTO settings_db (userId) VALUES (?);`,
    ).run(userId);

    if (queryResult.changes === 0) {
      throw new Error("Insert failed: no changes made");
    }

    return queryResult;
  });
}

export function updateSettings(
  userId: number,
  updatedSettings: Settings,
  dbFile: PathLike,
) {
  return withDB(dbFile, (db) => {
    const queryResult = db.prepare(
      `UPDATE OR FAIL settings_db SET storeMentalHealthInfo = ?, custom404ImagePath = ? WHERE userId = ?`,
    ).run(
      Number(updatedSettings.storeMentalHealthInfo),
      updatedSettings.custom404ImagePath || null,
      userId,
    );

    if (queryResult.changes === 0) {
      throw new Error("Update failed: no changes made");
    }

    return queryResult;
  });
}

/**
 * @param userId
 * @param dbFile
 * @returns
 */
export function getSettingsById(userId: number, dbFile: PathLike): Settings | undefined {
  return withDB(dbFile, (db) => {
    const queryResult = db.prepare(
      `SELECT * FROM settings_db WHERE userId = ?`,
    ).get(userId);

    if (!queryResult) return undefined;

    return {
      id: Number(queryResult.id),
      userId: Number(queryResult.userId),
      storeMentalHealthInfo: Boolean(Number(queryResult.storeMentalHealthInfo)),
      custom404ImagePath: queryResult.custom404ImagePath?.toString() || null,
    };
  });
}

export function updateCustom404Image(userId: number, imagePath: string | null, dbFile: PathLike) {
  return withDB(dbFile, (db) => {
    const queryResult = db.prepare(
      `UPDATE OR FAIL settings_db SET custom404ImagePath = ? WHERE userId = ?`,
    ).run(imagePath, userId);

    if (queryResult.changes === 0) {
      throw new Error("Update failed: no changes made");
    }

    return queryResult;
  });
}
