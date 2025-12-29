import { DatabaseSync } from "node:sqlite";
import {
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
import { testDbFile, testDbFileBasePath } from "../constants/paths.ts";
import { existsSync } from "node:fs";

// Create test db directory structure
if (!existsSync(testDbFileBasePath)) {
  Deno.mkdirSync(testDbFileBasePath, { recursive: true });
}

Deno.test("Test createEntryTable()", () => {
  // Create test entry db
  createEntryTable(testDbFile);

  // Get table
  const db = new DatabaseSync(testDbFile);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'entry_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "entry_db");
  Deno.removeSync(testDbFile);
});

Deno.test("Test createGadScoreTable()", () => {
  // Create test gad score table
  createGadScoreTable(testDbFile);

  // Get the table info from the table
  const db = new DatabaseSync(testDbFile);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'gad_score_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "gad_score_db");
  Deno.removeSync(testDbFile);
});

Deno.test("Test createPhqScoreTable()", () => {
  // Create test gad score table
  createPhqScoreTable(testDbFile);

  // Get the table info from the table
  const db = new DatabaseSync(testDbFile);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'phq_score_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "phq_score_db");
  Deno.removeSync(testDbFile);
});

Deno.test("Test createUserTable()", () => {
  // Create test gad score table
  createUserTable(testDbFile);

  // Get the table info from the table
  const db = new DatabaseSync(testDbFile);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'user_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "user_db");
  Deno.removeSync(testDbFile);
});

Deno.test("Test createSettingsTable()", () => {
  // Create test gad score table
  createSettingsTable(testDbFile);

  // Get the table info from the table
  const db = new DatabaseSync(testDbFile);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'settings_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "settings_db");
  Deno.removeSync(testDbFile);
});

Deno.test("Test createJournalTable()", () => {
  // Create test gad score table
  createJournalTable(testDbFile);

  // Get the table info from the table
  const db = new DatabaseSync(testDbFile);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'journal_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "journal_db");
  Deno.removeSync(testDbFile);
});

Deno.test("Test createJournalEntryPhotosTable()", () => {
  // Create test gad score table
  createJournalEntryPhotosTable(testDbFile);

  // Get the table info from the table
  const db = new DatabaseSync(testDbFile);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'photo_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "photo_db");
  Deno.removeSync(testDbFile);
});

Deno.test("Test createVoiceRecordingTable()", () => {
  createVoiceRecordingTable(testDbFile);

  // Get the table info from the table
  const db = new DatabaseSync(testDbFile);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'voice_recording_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "voice_recording_db");
  Deno.removeSync(testDbFile);
});
