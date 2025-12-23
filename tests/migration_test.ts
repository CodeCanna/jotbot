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

const testDbPath = "db/test_db/jotbot_test.db";
Deno.test("Test createEntryTable()", async () => {
  // Create test entry db
  await createEntryTable(testDbPath);

  // Get table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'entry_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "entry_db");
  await Deno.removeSync(testDbPath);
});

Deno.test("Test createGadScoreTable()", async () => {
  // Create test gad score table
  await createGadScoreTable(testDbPath);

  // Get the table info from the table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'gad_score_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "gad_score_db");
  await Deno.removeSync(testDbPath);
});

Deno.test("Test createPhqScoreTable()", async () => {
  // Create test gad score table
  await createPhqScoreTable(testDbPath);

  // Get the table info from the table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'phq_score_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "phq_score_db");
  await Deno.removeSync(testDbPath);
});

Deno.test("Test createUserTable()", async () => {
  // Create test gad score table
  await createUserTable(testDbPath);

  // Get the table info from the table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'user_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "user_db");
  await Deno.removeSync(testDbPath);
});

Deno.test("Test createSettingsTable()", async () => {
  // Create test gad score table
  await createSettingsTable(testDbPath);

  // Get the table info from the table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'settings_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "settings_db");
  await Deno.removeSync(testDbPath);
});

Deno.test("Test createJournalTable()", async () => {
  // Create test gad score table
  await createJournalTable(testDbPath);

  // Get the table info from the table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'journal_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "journal_db");
  await Deno.removeSync(testDbPath);
});

Deno.test("Test createJournalEntryPhotosTable()", async () => {
  // Create test gad score table
  await createJournalEntryPhotosTable(testDbPath);

  // Get the table info from the table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'photo_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "photo_db");
  await Deno.removeSync(testDbPath);
});

Deno.test("Test createVoiceRecordingTable()", async () => {
  await createVoiceRecordingTable(testDbPath);

  // Get the table info from the table
  const db = new DatabaseSync(testDbPath);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'voice_recording_db';`,
  ).get();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "voice_recording_db");
  await Deno.removeSync(testDbPath);
});
