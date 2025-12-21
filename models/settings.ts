import { PathLike } from "node:fs";
import { Settings } from "../types/types.ts";
import { DatabaseSync } from "node:sqlite";

export function insertSettings(userId: number, dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);

    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    db.exec("PRAGMA foreign_keys = ON;");

    const queryResult = db.prepare(
      `INSERT INTO settings_db (userId) VALUES (?);`,
    ).run(userId);

    db.close();
    return queryResult;
  } catch (err) {
    console.error(`Failed to insert user ${userId} settings: ${err}`);
  }
}

export function updateSettings(
  userId: number,
  updatedSettings: Settings,
  dbFile: PathLike,
) {
  try {
    const db = new DatabaseSync(dbFile);
    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    db.exec("PRAGMA foreign_keys = ON;");

    const queryResult = db.prepare(
      `UPDATE OR FAIL settings_db SET storeMentalHealthInfo = ?, selfieDirectory = ? WHERE userId = ${userId}`,
    ).run(
      Number(updatedSettings.storeMentalHealthInfo),
      updatedSettings.selfieDirectory,
    );
    db.close();
    return queryResult;
  } catch (err) {
    console.error(`Failed to update user ${userId} settings: ${err}`);
  }
}
