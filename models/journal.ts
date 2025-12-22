import { PathLike } from "node:fs";
import { JournalEntry } from "../types/types.ts";
import { DatabaseSync } from "node:sqlite";

export function insertJournalEntry(
  journalEntry: JournalEntry,
  dbFile: PathLike,
) {
  try {
    const db = new DatabaseSync(dbFile);
    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    db.exec("PRAGMA foreign_keys = ON;");

    const queryResult = db.prepare(
      `INSERT INTO journal_db (userId, timestamp, lastEditedTimestamp, content, length, images, voiceRecordings) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    ).run(
      journalEntry.userId,
      journalEntry.timestamp,
      journalEntry.lastEditedTimestamp || null,
      journalEntry.content,
      journalEntry.length,
      journalEntry.images?.join(",") || null,
      journalEntry.voiceRecordings?.join(",") || null,
    );

    db.close();
    return queryResult;
  } catch (err) {
    console.error(
      `Failed to insert journal entry ${journalEntry.id} into db: ${err}`,
    );
  }
}

export function updateJournalEntry(
  journalEntry: JournalEntry,
  dbFile: PathLike,
) {
  try {
    const db = new DatabaseSync(dbFile);
    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    db.exec("PRAGMA foreign_keys = ON;");

    const queryResult = db.prepare(
      `UPDATE OR FAIL journal_db SET lastEditedTimestamp = ?, content = ?, length = ?, images = ?, voiceRecordings = ? WHERE id = ${journalEntry.id};`,
    ).run(
      journalEntry.lastEditedTimestamp!,
      journalEntry.content,
      journalEntry.length,
      journalEntry.images?.join(",") || null,
      journalEntry.voiceRecordings?.join(",") || null,
    );
    db.close();
    return queryResult;
  } catch (err) {
    console.error(`Failed to update journal entry ${journalEntry.id}: ${err}`);
  }
}

export function deleteJournalEntryById(
  id: number,
  dbFile: PathLike,
) {
  try {
    const db = new DatabaseSync(dbFile);
    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    db.exec("PRAGMA foreign_keys = ON;");

    const queryResult = db.prepare(
      `DELETE FROM journal_db WHERE id = ${id};`,
    ).run();
    db.close();
    return queryResult;
  } catch (err) {
    console.error(`Failed to retrieve journal entry ${id}: ${err}`);
  }
}

export function getJournalEntryById(
  id: number,
  dbFile: PathLike,
) {
  try {
    const db = new DatabaseSync(dbFile);
    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    db.exec("PRAGMA foreign_keys = ON;");

    const journalEntry = db.prepare(
      `SELECT * FROM journal_db WHERE id = ${id};`,
    ).get();
    db.close();
    return {
      id: Number(journalEntry?.id!),
      userId: Number(journalEntry?.userId!),
      timestamp: Number(journalEntry?.timestamp!),
      lastEditedTimestamp: Number(journalEntry?.lastEditedTimestamp) || null,
      content: String(journalEntry?.content!),
      length: Number(journalEntry?.length!),
      images: journalEntry?.images?.toString().split(",") || null,
      voiceRecordings: journalEntry?.voiceRecordings?.toString().split(",") ||
        null,
    };
  } catch (err) {
    console.error(`Failed to retrieve journal entry ${id}: ${err}`);
  }
}

export function getAllJournalEntriesByUserId(userId: number, dbFile: PathLike) {
  const journalEntries: JournalEntry[] = [];
  try {
    const db = new DatabaseSync(dbFile);
    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    db.exec("PRAGMA foreign_keys = ON;");

    const journalEntriesResults = db.prepare(
      `SELECT * FROM journal_db WHERE userId = ${userId} ORDER BY timestamp DESC;`,
    ).all();
    for (const je in journalEntriesResults) {
      const journalEntry: JournalEntry = {
        id: Number(journalEntriesResults[je]?.id!),
        userId: Number(journalEntriesResults[je]?.userId!),
        timestamp: Number(journalEntriesResults[je]?.timestamp!),
        lastEditedTimestamp:
          Number(journalEntriesResults[je]?.lastEditedTimestamp) || null,
        content: String(journalEntriesResults[je]?.content!),
        length: Number(journalEntriesResults[je]?.length!),
        images: String(journalEntriesResults[je]?.images).split(",") || null,
        voiceRecordings:
          String(journalEntriesResults[je]?.voiceRecordings).split(",") ||
          null,
      };
      journalEntries.push(journalEntry);
    }
    db.close();
  } catch (err) {
    console.error(
      `Failed to retrieve entries that belong to ${userId}: ${err}`,
    );
  }
  return journalEntries;
}
