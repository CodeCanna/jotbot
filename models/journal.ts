import { PathLike } from "node:fs";
import { JournalEntry } from "../types/types.ts";
import { sqlFilePath } from "../constants/paths.ts";
import { logger } from "../utils/logger.ts";
import { withDB } from "../utils/dbHelper.ts";

const sqlPath = `${sqlFilePath}/journal_entry`;

/**
 * Stores a journal entry
 * @param journalEntry Journal entry to store
 * @param dbFile The file path pointing to DB file
 * @returns StatementResultingChanges shows changes made to DB
 */
export function insertJournalEntry(
  journalEntry: JournalEntry,
  dbFile: PathLike,
) {
  return withDB(dbFile, (db) => {
    const queryResult = db.prepare(
      `INSERT INTO journal_db (userId, timestamp, lastEditedTimestamp, content, length) VALUES (?, ?, ?, ?, ?);`,
    ).run(
      journalEntry.userId,
      journalEntry.timestamp,
      journalEntry.lastEditedTimestamp || null,
      journalEntry.content,
      journalEntry.length,
    );

    if (queryResult.changes === 0) {
      throw new Error(`Insert failed: no changes made`);
    }

    return queryResult;
  });
}

/**
 * Updates JournalEntry passed in DB
 * @param journalEntry The journal entry to update
 * @param dbFile The file path pointing to DB file
 * @returns StatementResultingChanges shows changes made to DB
 */
export function updateJournalEntry(
  journalEntry: JournalEntry,
  dbFile: PathLike,
) {
  return withDB(dbFile, (db) => {
    const query = Deno.readTextFileSync(`${sqlPath}/update_journal_entry.sql`)
      .replace("<ID>", (journalEntry.id ?? 0).toString()).trim();

    const queryResult = db.prepare(query).run(
      journalEntry.lastEditedTimestamp ?? Date.now(),
      journalEntry.content,
      journalEntry.length,
    );

    if (queryResult.changes === 0) {
      throw new Error(`Update failed: no changes made`);
    }

    return queryResult;
  });
}

/**
 * Deletes a journal entry by it's id
 * @param id Id of journal entry to delete
 * @param dbFile The file path pointing to DB file
 * @returns StatementResultingChanges shows changes made to DB
 */
export function deleteJournalEntryById(
  id: number,
  dbFile: PathLike,
) {
  return withDB(dbFile, (db) => {
    const queryResult = db.prepare(
      `DELETE FROM journal_db WHERE id = ?;`,
    ).run(id);

    if (queryResult.changes === 0) {
      logger.warn(`No journal entry found with ID ${id} to delete`);
    }

    return queryResult;
  });
}

/**
 * Retrieve a journal entry from database by it's id
 * @param id Id of entry to retrieve
 * @param dbFile The file path pointing to DB file
 * @returns JournalEntry
 */
export function getJournalEntryById(
  id: number,
  dbFile: PathLike,
): JournalEntry | undefined {
  return withDB(dbFile, (db) => {
    const journalEntry = db.prepare(
      `SELECT * FROM journal_db WHERE id = ?;`,
    ).get(id);

    if (!journalEntry) return undefined;

    return {
      id: Number(journalEntry.id),
      userId: Number(journalEntry.userId),
      imagesId: Number(journalEntry.imagesId) || null,
      voiceRecordingsId: Number(journalEntry.voiceRecordingsId) || null,
      timestamp: Number(journalEntry.timestamp),
      lastEditedTimestamp: Number(journalEntry.lastEditedTimestamp) || null,
      content: String(journalEntry.content),
      length: Number(journalEntry.length),
    };
  });
}

/**
 * Grab all of a user's journal entries
 * @param userId The id of user who owns journal entries
 * @param dbFile The file path pointing to DB file
 * @returns JournalEntry[]
 */
export function getAllJournalEntriesByUserId(userId: number, dbFile: PathLike) {
  return withDB(dbFile, (db) => {
    const journalEntriesResults = db.prepare(
      `SELECT * FROM journal_db WHERE userId = ? ORDER BY timestamp DESC;`,
    ).all(userId);
    const journalEntries: JournalEntry[] = [];

    for (const je in journalEntriesResults) {
      const journalEntry: JournalEntry = {
        id: Number(journalEntriesResults[je]?.id),
        userId: Number(journalEntriesResults[je]?.userId),
        timestamp: Number(journalEntriesResults[je]?.timestamp),
        lastEditedTimestamp:
          Number(journalEntriesResults[je]?.lastEditedTimestamp) || null,
        content: String(journalEntriesResults[je]?.content),
        length: Number(journalEntriesResults[je]?.length),
        imagesId: Number(journalEntriesResults[je]?.imagesId) || null,
        voiceRecordingsId:
          Number(journalEntriesResults[je]?.voiceRecordingsId!) ||
          null,
      };

      journalEntries.push(journalEntry);
    }
    return journalEntries;
  });
}
