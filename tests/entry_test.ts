import { assertEquals } from "@std/assert/equals";
import { createEntryTable, createUserTable } from "../db/migration.ts";
import { insertUser } from "../models/user.ts";
import { Entry, User } from "../types/types.ts";
import {
  deleteEntryById,
  getAllEntriesByUserId,
  getEntryById,
  insertEntry,
  updateEntry,
} from "../models/entry.ts";
import { testDbFile } from "../constants/paths.ts";
import { assertObjectMatch } from "@std/assert/object-match";

// Create test entry
const testEntry: Entry = {
  id: 1,
  userId: 12345,
  timestamp: 1234567899,
  lastEditedTimestamp: null,
  emotion: {
    emotionName: "Test",
    emotionEmoji: "Test",
    emotionDescription: "Test",
  },
  situation: "Test",
  automaticThoughts: "Test",
  selfiePath: null,
};

// Create test user
const testUser: User = {
  telegramId: 12345,
  username: "username",
  dob: new Date(Date.now()),
  joinedDate: new Date(Date.now()),
};

Deno.test("Test insertEntry()", () => {
  // Create test Database
  createUserTable(testDbFile);
  createEntryTable(testDbFile);

  try {
    // Insert test user
    insertUser(testUser, testDbFile);
  } catch (_err) {
    console.log("User already inserted");
  }

  // Insert test entry
  const queryResult = insertEntry(testEntry, testDbFile);

  assertEquals(queryResult.changes, 1);
  assertEquals(queryResult.lastInsertRowid, 1);

  // Clean up
  Deno.removeSync(testDbFile);
});

Deno.test("Test updateEntry()", () => {
  // Create test Database
  createUserTable(testDbFile);
  createEntryTable(testDbFile);

  insertUser(testUser, testDbFile);
  //Insert test entry
  insertEntry(testEntry, testDbFile);

  // Modify entry
  testEntry.situation = "Test Updated Text";
  testEntry.lastEditedTimestamp = 123456789;

  // Update entry
  const queryResult = updateEntry(1, testEntry, testDbFile);

  assertEquals(queryResult.changes, 1);
  assertEquals(queryResult.lastInsertRowid, 0);

  // Clean up
  Deno.removeSync(testDbFile);
});

Deno.test("Test deleteEntryById()", () => {
  // Create test Database
  createUserTable(testDbFile);
  createEntryTable(testDbFile);

  insertUser(testUser, testDbFile);
  //Insert test entry
  insertEntry(testEntry, testDbFile);

  const queryResult = deleteEntryById(testEntry.id!, testDbFile);

  assertEquals(queryResult?.changes, 1);
  assertEquals(queryResult?.lastInsertRowid, 0);

  // Clean up
  Deno.removeSync(testDbFile);
});

Deno.test("Test getEntryById()", () => {
  // Create test Database
  createUserTable(testDbFile);
  createEntryTable(testDbFile);

  insertUser(testUser, testDbFile);
  //Insert test entry
  insertEntry(testEntry, testDbFile);

  // Get entry by id
  const entry = getEntryById(1, testDbFile);
  if (!entry) throw new Error("Expected entry to be defined");

  assertObjectMatch(testEntry, entry);

  // Clean up
  Deno.removeSync(testDbFile);
});

Deno.test("Test getAllEntriesByUserId()", () => {
  // Create test Database
  createUserTable(testDbFile);
  createEntryTable(testDbFile);
  insertUser(testUser, testDbFile);

  // Insert 5 entries
  for (let i = 0; i < 5; i++) {
    insertEntry(testEntry, testDbFile);
  }

  const entries = getAllEntriesByUserId(testUser.telegramId, testDbFile);

  for (const entry in entries) {
    // Test the ids
    assertEquals(entries[entry].id, Number(entry) + 1);
  }

  Deno.removeSync(testDbFile);
});
