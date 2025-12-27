import { DatabaseSync } from "node:sqlite";
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
import { assertNotEquals } from "@std/assert/not-equals";
import { assertEquals } from "@std/assert/equals";

const testDbPath = "db/test_db/jotbot_test.db";
Deno.test("Test createEntryTable()", () => {
  // Create test entry db
  createEntryTable(testDbPath);

  // Get table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'entry_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "entry_db");
  Deno.removeSync(testDbPath);
});

Deno.test("Test createGadScoreTable()", () => {
  // Create test gad score table
  createGadScoreTable(testDbPath);

  // Get the table info from the table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'gad_score_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "gad_score_db");
  Deno.removeSync(testDbPath);
});

Deno.test("Test createPhqScoreTable()", () => {
  // Create test gad score table
  createPhqScoreTable(testDbPath);

  // Get the table info from the table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'phq_score_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "phq_score_db");
  Deno.removeSync(testDbPath);
});

Deno.test("Test createUserTable()", () => {
  // Create test gad score table
  createUserTable(testDbPath);

  // Get the table info from the table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'user_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "user_db");
  Deno.removeSync(testDbPath);
});

Deno.test("Test createSettingsTable()", () => {
  // Create test gad score table
  createSettingsTable(testDbPath);

  // Get the table info from the table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'settings_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "settings_db");
  Deno.removeSync(testDbPath);
});

Deno.test("Test createJournalTable()", () => {
  // Create test gad score table
  createJournalTable(testDbPath);

  // Get the table info from the table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'journal_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "journal_db");
  Deno.removeSync(testDbPath);
});

Deno.test("Test createJournalEntryPhotosTable()", () => {
  // Create test gad score table
  createJournalEntryPhotosTable(testDbPath);

  // Get the table info from the table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'photo_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "photo_db");
  Deno.removeSync(testDbPath);
});

Deno.test("Test createVoiceRecordingTable()", () => {
  createVoiceRecordingTable(testDbPath);

  // Get the table info from the table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'voice_recording_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "voice_recording_db");
  Deno.removeSync(testDbPath);
});

Deno.test("Test addCustom404Column()", () => {
  // First create the settings table
  createSettingsTable(testDbPath);

  // Add the column
  addCustom404Column(testDbPath);

  // Verify the column exists
  const db = new DatabaseSync(testDbPath);
  const columns = db.prepare("PRAGMA table_info(settings_db);").all() as {
    name: string;
  }[];
  const hasColumn = columns.some((col) => col.name === "custom404ImagePath");

  assertEquals(hasColumn, true);
  Deno.removeSync(testDbPath);
});
