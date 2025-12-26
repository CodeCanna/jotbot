import { DatabaseSync, SQLOutputValue } from "node:sqlite";
import { Entry } from "../types/types.ts";
import { PathLike } from "node:fs";
import { sqlFilePath } from "../constants/paths.ts";

const sqlFilePathEntry = `${sqlFilePath}/entry`;

/**
 * Insert entry into entry_db
 * @param entry Entry - Entry to insert into entry_db
 * @param dbFile PathLike - Path to the sqlite db file
 * @returns StatementResultingChanges
 */
export function insertEntry(entry: Entry, dbFile: PathLike) {
  const db = new DatabaseSync(dbFile);
  const query = Deno.readTextFileSync(`${sqlFilePathEntry}/insert_entry.sql`)
    .trim(); // Grab query from file
  if (
    !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
  ) throw new Error("JotBot Error: Database integrity check failed!");
  db.exec("PRAGMA foreign_keys = ON;");
  const queryResult = db.prepare(query).run(
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
    ) throw new Error("JotBot Error: Database integrity check failed!");
    db.exec("PRAGMA foreign_keys = ON;");
    const queryResult = db.prepare(
      `UPDATE OR FAIL entry_db SET
      lastEditedTimestamp = ?,
      situation = ?,
      automaticThoughts = ?,
      emotionName = ?,
      emotionEmoji = ?,
      emotionDescription = ?
      WHERE id = ?;`
    ).run(
      updatedEntry.lastEditedTimestamp!,
      updatedEntry.situation!,
      updatedEntry.automaticThoughts!,
      updatedEntry.emotion.emotionName!,
      updatedEntry.emotion.emotionEmoji! || null,
      updatedEntry.emotion.emotionDescription!,
      entryId,
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
    ) throw new Error("JotBot Error: Database integrity check failed!");
    db.exec("PRAGMA foreign_keys = ON;");
    const queryResult = db.prepare(`DELETE FROM entry_db WHERE id = ?;`).run(entryId);

    if (queryResult.changes === 0) {
      throw new Error(
        `Query ran but no changes were made.`,
      );
    }

    db.close();
    return queryResult;
  } catch (err) {
    console.error(`Failed to delete entry ${entryId} from entry_db: ${err}`);
    throw err;
  }
}

/**
 * @param entryId Number - ID of user who owns this entry
 * @param dbFile PathLike - Path to the sqlite db file
 * @returns Entry
 */
export function getEntryById(entryId: number, dbFile: PathLike): Entry | undefined {
  let queryResult: Record<string, SQLOutputValue> | undefined;
  try {
    const db = new DatabaseSync(dbFile);
    if (
      !(db.prepare("PRAGMA integrity_check(entry_db);").get()
        ?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Database integrity check failed!");
    db.exec("PRAGMA foreign_keys = ON;");
    queryResult = db.prepare(`SELECT * FROM entry_db WHERE id = ?;`).get(entryId);
    if (!queryResult) return undefined;
    db.close();
  } catch (err) {
    console.error(`Failed to retrieve entry: ${entryId}: ${err}`);
    throw err;
  }

  return {
    id: Number(queryResult.id),
    userId: Number(queryResult.userId),
    timestamp: Number(queryResult.timestamp),
    lastEditedTimestamp: Number(queryResult.lastEditedTimestamp) || null,
    situation: String(queryResult.situation),
    automaticThoughts: String(queryResult.automaticThoughts),
    emotion: {
      emotionName: String(queryResult.emotionName),
      emotionEmoji: String(queryResult.emotionEmoji),
      emotionDescription: String(queryResult.emotionDescription),
    },
    selfiePath: queryResult.selfiePath?.toString() || null,
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
    ) throw new Error("JotBot Error: Database integrity check failed!");
    const queryResults = db.prepare(`SELECT * FROM entry_db WHERE userId = ? ORDER BY timestamp DESC;`).all(userId);
    for (const result of queryResults) {
      const entry: Entry = {
        id: Number(result.id),
        userId: Number(result.userId),
        timestamp: Number(result.timestamp),
        lastEditedTimestamp: Number(result.lastEditedTimestamp),
        situation: result.situation?.toString() || "",
        automaticThoughts: result.automaticThoughts?.toString() || "",
        emotion: {
          emotionName: result.emotionName?.toString() || "",
          emotionEmoji: result.emotionEmoji?.toString() || "",
          emotionDescription: result.emotionDescription?.toString() || "",
        },
        selfiePath: result.selfiePath?.toString() || null,
      };

      entries.push(entry);
    }
    db.close();
  } catch (err) {
    console.error(
      `Jotbot Error: Failed retrieving all entries for user ${userId}: ${err}`,
    );
    throw err;
  }
  return entries;
}
