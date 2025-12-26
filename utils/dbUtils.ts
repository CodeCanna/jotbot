import { PathLike } from "node:fs";
import {
  addCustom404Column,
  createEntryTable,
  createGadScoreTable,
  createJournalEntryPhotosTable,
  createJournalTable,
  createPhqScoreTable,
  createSettingsTable,
  createUserTable,
  createVoiceRecordingTable,
} from "../db/migration.ts";
import { DatabaseSync } from "node:sqlite";

/**
 * @param dbFile
 */
export function createDatabase(dbFile: PathLike) {
  try {
    createUserTable(dbFile);
    createGadScoreTable(dbFile);
    createPhqScoreTable(dbFile);
    createEntryTable(dbFile);
    createSettingsTable(dbFile);
    createJournalTable(dbFile);
    createJournalEntryPhotosTable(dbFile);
    createVoiceRecordingTable(dbFile);
    addCustom404Column(dbFile);  // Add custom 404 column migration
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to create database: ${err}`);
  }
}

/**
 * @param dbFile
 * @param tableName
 * @returns
 */
export function getLatestId(
  dbFile: PathLike,
  tableName: string,
): number {
  let id;
  try {
    const db = new DatabaseSync(dbFile);
    const query = Deno.readTextFileSync("db/sql/misc/get_latest_entry_id.sql")
      .replace("<TABLE_NAME>", tableName).trim();
    id = db.prepare(query).get();
  } catch (err) {
    console.error(`Failed to retrieve latest id from ${tableName}: ${err}`);
  }
  return Number(id?.max_id) || 0;
}
