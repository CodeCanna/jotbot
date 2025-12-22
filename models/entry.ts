import { DatabaseSync, SQLOutputValue } from "node:sqlite";
import { Entry } from "../types/types.ts";
import { PathLike } from "node:fs";

/**
 * Insert entry into entry_db
 * @param entry Entry - Entry to insert into entry_db
 * @param dbFile PathLike - Path to the sqlite db file
 * @returns StatementResultingChanges
 */
export function insertEntry(entry: Entry, dbFile: PathLike) {
  const db = new DatabaseSync(dbFile);
  if (
    !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
  ) throw new Error("JotBot Error: Databaes integrety check failed!");
  db.exec("PRAGMA foreign_keys = ON;");
  const queryResult = db.prepare(
    `INSERT INTO entry_db (userId, timestamp, lastEditedTimestamp, situation, automaticThoughts, emotionName, emotionEmoji, emotionDescription, selfiePath) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
  ).run(
    entry.userId,
    entry.timestamp!,
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
  return queryResult;
}

/**
 * Update an entry based on it's ID
 * @param entryId number - ID of entry to update
 * @param updatedEntry Entry - Updated entry to store
 * @param dbFile PathLike - Path to the sqlite db file
 * @returns StatementResultingChanges
 */
export function updateEntry(
  entryId: number,
  updatedEntry: Entry,
  dbFile: PathLike,
) {
  try {
    const db = new DatabaseSync(dbFile);
    if (
      !(db.prepare("PRAGMA integrity_check(entry_db);").get()
        ?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    db.exec("PRAGMA foreign_keys = ON;");
    const queryResult = db.prepare(
      `UPDATE OR FAIL entry_db SET lastEditedTimestamp = ?, situation = ?, automaticThoughts = ?, emotionName = ?, emotionEmoji = ?, emotionDescription = ? WHERE id = ${updatedEntry.id};`,
    ).run(
      updatedEntry.lastEditedTimestamp!,
      updatedEntry.situation!,
      updatedEntry.automaticThoughts!,
      updatedEntry.emotion.emotionName!,
      updatedEntry.emotion.emotionEmoji! || null,
      updatedEntry.emotion.emotionDescription!,
    );

    if (queryResult.changes === 0) {
      throw new Error(
        `Query ran but no changes were made.`,
      );
    }

    db.close();
    return queryResult;
  } catch (err) {
    console.error(`Failed to update entry ${entryId}: ${err}`);
    throw new Error(`Failed to update entry ${entryId} in entry_db: ${err}`);
  }
}

/**
 * Deletes an entry by it's ID
 * @param entryId Number - ID of entry to delete
 * @param dbFile PathLike - Path to the sqlite db file
 * @returns StatementResultingChanges | undefined
 */
export function deleteEntryById(entryId: number, dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    if (
      !(db.prepare("PRAGMA integrity_check(entry_db);").get()
        ?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    db.exec("PRAGMA foreign_keys = ON;");
    const queryResult = db.prepare(
      `DELETE FROM entry_db WHERE id = '${entryId}';`,
    ).run();

    if (queryResult.changes === 0) {
      throw new Error(
        `Query ran but no changes were made.`,
      );
    }

    db.close();
    return queryResult;
  } catch (err) {
    console.error(`Failed to delete entry ${entryId} from entry_db: ${err}`);
  }
}

/**
 * 
 * @param entryId Number - ID of user who owns this entry
 * @param dbFile PathLike - Path to the sqlite db file
 * @returns Entry
 */
export function getEntryById(entryId: number, dbFile: PathLike): Entry {
  let queryResult: Record<string, SQLOutputValue> | undefined;
  try {
    const db = new DatabaseSync(dbFile);
    if (
      !(db.prepare("PRAGMA integrity_check(entry_db);").get()
        ?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    db.exec("PRAGMA foreign_keys = ON;");
    queryResult = db.prepare(`SELECT * FROM entry_db WHERE id = ${entryId}`)
      .get();
    db.close();
  } catch (err) {
    console.error(`Failed to retrieve entry: ${entryId}: ${err}`);
  }

  return {
    id: Number(queryResult?.id!),
    userId: Number(queryResult?.userId!),
    timestamp: Number(queryResult?.timestamp!),
    lastEditedTimestamp: Number(queryResult?.lastEditedTimestamp!) || null,
    situation: String(queryResult?.situation!),
    automaticThoughts: String(queryResult?.automaticThoughts!),
    emotion: {
      emotionName: String(queryResult?.emotionName!),
      emotionEmoji: String(queryResult?.emotionEmoji!),
      emotionDescription: String(queryResult?.emotionDescription!),
    },
    selfiePath: queryResult?.selfiePath?.toString() || null,
  };
}

/**
 * Retrieve all of a user's entries from entry_db table
 * @param userId Number - ID of user who owns these entries
 * @param dbFile PathLike - Path to the sqlite db file
 * @returns Entry[]
 */
export function getAllEntriesByUserId(
  userId: number,
  dbFile: PathLike,
): Entry[] {
  const entries = [];
  try {
    const db = new DatabaseSync(dbFile);
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
    console.error(
      `Jotbot Error: Failed retrieving all entries for user ${userId}: ${err}`,
    );
  }
  return entries;
}
