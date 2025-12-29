import { existsSync, PathLike } from "node:fs";
import {
  createEntryTable,
  createGadScoreTable,
  createPhqScoreTable,
  createSettingsTable,
  createUserTable,
} from "../db/migration.ts";
import { DatabaseSync } from "node:sqlite";
import { dbFileBasePath } from "../constants/paths.ts";

/**
 * @param dbFile
 */
export function createDatabase(dbFile: PathLike) {
  try {
    // Create db directory structure
    if (!existsSync(dbFileBasePath)) {
      Deno.mkdirSync(dbFileBasePath, { recursive: true });
    }

    // Create db
    createUserTable(dbFile);
    createGadScoreTable(dbFile);
    createPhqScoreTable(dbFile);
    createEntryTable(dbFile);
    createSettingsTable(dbFile);
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
  return Number(id?.seq);
}
