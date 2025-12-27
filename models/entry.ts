import { Entry } from "../types/types.ts";
import { PathLike } from "node:fs";
import { sqlFilePath } from "../constants/paths.ts";
import { logger } from "../utils/logger.ts";
import { withDB } from "../utils/dbHelper.ts";

const sqlFilePathEntry = `${sqlFilePath}/entry`;

/**
 * Insert entry into entry_db
 * @param entry Entry - Entry to insert into entry_db
 * @param dbFile PathLike - Path to the sqlite db file
 * @returns StatementResultingChanges
 */
export function insertEntry(entry: Entry, dbFile: PathLike) {
  return withDB(dbFile, (db) => {
    const query = Deno.readTextFileSync(`${sqlFilePathEntry}/insert_entry.sql`)
      .trim();
    const queryResult = db.prepare(query).run(
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
      logger.error(
        `Failed to insert entry for user ${entry.userId}: No changes made`,
      );
      throw new Error("Failed to insert entry: Database returned no changes");
    }

    return queryResult;
  });
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
  return withDB(dbFile, (db) => {
    const queryResult = db.prepare(
      `UPDATE OR FAIL entry_db SET
      lastEditedTimestamp = ?,
      situation = ?,
      automaticThoughts = ?,
      emotionName = ?,
      emotionEmoji = ?,
      emotionDescription = ?
      WHERE id = ?;`,
    ).run(
      updatedEntry.lastEditedTimestamp ?? Date.now(),
      updatedEntry.situation,
      updatedEntry.automaticThoughts,
      updatedEntry.emotion.emotionName,
      updatedEntry.emotion.emotionEmoji || null,
      updatedEntry.emotion.emotionDescription,
      entryId,
    );

    if (queryResult.changes === 0) {
      logger.error(`Failed to update entry ${entryId}: No changes made`);
      throw new Error(
        `Failed to update entry: Entry ID ${entryId} not found or no changes made`,
      );
    }

    return queryResult;
  });
}

/**
 * Deletes an entry by it's ID
 * @param entryId Number - ID of entry to delete
 * @param dbFile PathLike - Path to the sqlite db file
 * @returns StatementResultingChanges | undefined
 */
export function deleteEntryById(entryId: number, dbFile: PathLike) {
  return withDB(dbFile, (db) => {
    const queryResult = db.prepare(`DELETE FROM entry_db WHERE id = ?;`).run(
      entryId,
    );

    if (queryResult.changes === 0) {
      logger.warn(`No entry found with ID ${entryId} to delete`);
    }

    return queryResult;
  });
}

/**
 * @param entryId Number - ID of user who owns this entry
 * @param dbFile PathLike - Path to the sqlite db file
 * @returns Entry
 */
export function getEntryById(
  entryId: number,
  dbFile: PathLike,
): Entry | undefined {
  return withDB(dbFile, (db) => {
    const queryResult = db.prepare(`SELECT * FROM entry_db WHERE id = ?;`).get(
      entryId,
    );
    if (!queryResult) return undefined;

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
  });
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
  return withDB(dbFile, (db) => {
    const queryResults = db.prepare(
      `SELECT * FROM entry_db WHERE userId = ? ORDER BY timestamp DESC;`,
    ).all(userId);
    const entries = [];
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
    return entries;
  });
}
