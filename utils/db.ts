import { PathLike } from "node:fs";
import {
  createEntryTable,
  createGadScoreTable,
  createPhqScoreTable,
  createSettingsTable,
  createUserTable,
} from "../db/migration.ts";

export function createDatabase(dbFile: PathLike) {
  try {
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
