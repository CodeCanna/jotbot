import { DatabaseSync, SQLInputValue } from "node:sqlite";
import { Entry } from "../types/types.ts";

export function insertEntry(entry: Entry) {
  const db = new DatabaseSync("db/jotbot.db");
  db.exec("PRAGMA foreign_keys = ON;");
  db.prepare(
    `INSERT INTO entry_db (userId, timestamp, situation, automaticThoughts, moodName, moodEmoji, moodDescription, selfiePath) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    entry.userId,
    entry.timestamp,
    entry.situation,
    entry.automaticThoughts,
    entry.mood.moodName,
    entry.mood.moodEmoji,
    entry.mood.moodDescription,
    entry.selfiePath,
  );
  db.close();
}

export function getAllEntries(userId: number): Record<string, SQLInputValue>[] {
  const entries = [];
  try {
    const db = new DatabaseSync("db/jotbot.db");
    const queryResults = db.prepare(
      `SELECT * FROM entry_db WHERE userId = '${userId}' ORDER BY timestamp DESC`,
    ).all();
    for (const entry in queryResults) {
      entries.push(queryResults[entry]);
    }
    db.close();
  } catch (err) {
    console.log(
      `Jotbot Error: Failed retrieving all entries for user ${userId}: ${err}`,
    );
  }
  return entries;
}

export function deleteEntry(entryId: number) {
  try {
    const db = new DatabaseSync("db/jotbot.db");
    db.prepare(`DELETE FROM entry_db WHERE id = '${entryId}'`).run();
    db.close();
  } catch (err) {
    console.log(`Failed to delete entry ${entryId} from entry_db: ${err}`);
  }
}
