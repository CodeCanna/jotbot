import { DatabaseSync } from "node:sqlite";
import { Entry } from "../types/types.ts";

export function insertEntry(entry: Entry) {
  const db = new DatabaseSync("db/jotbot.db");
  if (
    !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
  ) throw new Error("JotBot Error: Databaes integrety check failed!");
  db.exec("PRAGMA foreign_keys = ON;");
  db.prepare(
    `INSERT INTO entry_db (userId, timestamp, situation, automaticThoughts, emotionName, emotionEmoji, emotionDescription, selfiePath) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
  ).run(
    entry.userId,
    entry.timestamp,
    entry.situation,
    entry.automaticThoughts,
    entry.emotion.emotionName,
    entry.emotion.emotionEmoji || null,
    entry.emotion.emotionDescription,
    entry.selfiePath || null,
  );
  db.close();
}

export function getEntriesByUserId(userId: number): Entry[] {
  const entries = [];
  try {
    const db = new DatabaseSync("db/jotbot.db");
    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    const queryResults = db.prepare(
      `SELECT * FROM entry_db WHERE userId = '${userId}' ORDER BY timestamp DESC;`,
    ).all();
    for (const e in queryResults) {
      const entry: Entry = {
        id: Number(queryResults[e].id!),
        userId: Number(queryResults[e].userId!),
        timestamp: Number(queryResults[e].timestamp!),
        situation: queryResults[e].situation?.toString()!,
        automaticThoughts: queryResults[e].automaticThoughts?.toString()!,
        emotion: {
          emotionName: queryResults[e].emotionName?.toString()!,
          emotionEmoji: queryResults[e].emotionEmoji?.toString()!,
          emotionDescription: queryResults[e].emotionDescription?.toString()!,
        },
        selfiePath: queryResults[e].selfiePath?.toString()!,
      };

      entries.push(entry);
    }
    db.close();
  } catch (err) {
    console.log(
      `Jotbot Error: Failed retrieving all entries for user ${userId}: ${err}`,
    );
  }
  return entries;
}

export function editEntry(entryId: number, entry: Entry) {}

export function deleteEntryById(entryId: number) {
  try {
    const db = new DatabaseSync("db/jotbot.db");
    if (
      !(db.prepare("PRAGMA integrity_check(entry_db);").get()
        ?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    console.log(
      db.prepare(`DELETE FROM entry_db WHERE id = '${entryId}';`).run(),
    );
    console.log(entryId);
    db.close();
  } catch (err) {
    console.log(`Failed to delete entry ${entryId} from entry_db: ${err}`);
  }
}
