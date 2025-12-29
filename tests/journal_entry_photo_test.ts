import { assertEquals } from "@std/assert/equals";
import { testDbFile, testDbFileBasePath } from "../constants/paths.ts";
import {
  createJournalEntryPhotosTable,
  createJournalTable,
  createUserTable,
} from "../db/migration.ts";
import { insertJournalEntry } from "../models/journal.ts";
import { insertJournalEntryPhoto } from "../models/journal_entry_photo.ts";
import { insertUser } from "../models/user.ts";
import { JournalEntry, JournalEntryPhoto, User } from "../types/types.ts";
import { existsSync } from "node:fs";

// Create test db directory structure
if (!existsSync(testDbFileBasePath)) {
  Deno.mkdirSync(testDbFileBasePath, { recursive: true });
}

// Create test user
const testUser: User = {
  telegramId: 12345,
  username: "username",
  dob: new Date(Date.now()),
  joinedDate: new Date(Date.now()),
};

const testJournalEntry: JournalEntry = {
  userId: 12345,
  timestamp: 12345,
  content: "Test Content",
  length: 100,
};

const testJournalEntryPhoto: JournalEntryPhoto = {
  journalEntryId: 1,
  path: "/some/test/path.jpg",
  caption: "Test Caption",
  fileSize: 1024,
};

Deno.test("Test insertJournalEntryPhoto()", () => {
  createUserTable(testDbFile);
  createJournalTable(testDbFile);
  createJournalEntryPhotosTable(testDbFile);
  insertUser(testUser, testDbFile);
  insertJournalEntry(testJournalEntry, testDbFile);

  const queryResult = insertJournalEntryPhoto(
    testJournalEntryPhoto,
    testDbFile,
  );

  assertEquals(queryResult?.changes, 1);
  assertEquals(queryResult.lastInsertRowid, 1);
  Deno.removeSync(testDbFile);
});
