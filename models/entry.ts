import { DatabaseSync } from "node:sqlite";
import { Entry } from "../types/types.ts";

export function insertEntry(entry: Entry) {
  const db = new DatabaseSync("db/jotbot.db");
  if (
    !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
  ) throw new Error("JotBot Error: Databaes integrety check failed!");
  db.exec("PRAGMA foreign_keys = ON;");
  const queryResult = db.prepare(
    `INSERT INTO entry_db (userId, timestamp, lastEditedTimestamp, situation, automaticThoughts, emotionName, emotionEmoji, emotionDescription, selfiePath) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
  ).run(
    entry.userId,
    entry.timestamp,
    entry.lastEditedTimestamp || null,
    entry.situation,
    entry.automaticThoughts,
    entry.emotion.emotionName,
    entry.emotion.emotionEmoji || null,
    entry.emotion.emotionDescription,
    entry.selfiePath || null,
  );

  if (queryResult.changes === 0) {
    throw new Error(
      `Query ran but no changes were made.`,
    );
  }
  db.close();
}

export function updateEntry(entryId: number, entry: Entry) {
  try {
    const db = new DatabaseSync("db/jotbot.db");
    if (
      !(db.prepare("PRAGMA integrity_check(entry_db);").get()
        ?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    db.exec("PRAGMA foreign_keys = ON;");
    const queryResult = db.prepare(
      `UPDATE OR FAIL entry_db SET lastEditedTimestamp = ?, situation = ?, automaticThoughts = ?, emotionName = ?, emotionEmoji = ?, emotionDescription = ? WHERE id = ${entry.id};`,
    ).run(
      entry.lastEditedTimestamp!,
      entry.situation!,
      entry.automaticThoughts!,
      entry.emotion.emotionName!,
      entry.emotion.emotionEmoji! || null,
      entry.emotion.emotionDescription!,
    );

    if (queryResult.changes === 0) {
      throw new Error(
        `Query ran but no changes were made.`,
      );
    }

    db.close();
  } catch (err) {
    throw new Error(`Failed to update entry ${entryId} in entry_db: ${err}`);
  }
  console.log(`Entry ${entry.id} updated!`);
}

export function deleteEntryById(entryId: number) {
  try {
    const db = new DatabaseSync("db/jotbot.db");
    if (
      !(db.prepare("PRAGMA integrity_check(entry_db);").get()
        ?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");

    const queryResult = db.prepare(
      `DELETE FROM entry_db WHERE id = '${entryId}';`,
    ).run();

    if (queryResult.changes === 0) {
      throw new Error(
        `Query ran but no changes were made.`,
      );
    }
    db.close();
  } catch (err) {
    console.log(`Failed to delete entry ${entryId} from entry_db: ${err}`);
  }
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
        lastEditedTimestamp: Number(queryResults[e].lastEditedTimestamp!),
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
