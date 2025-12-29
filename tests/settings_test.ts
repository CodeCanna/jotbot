import { assertEquals } from "@std/assert/equals";
import { testDbFile, testDbFileBasePath } from "../constants/paths.ts";
import { createSettingsTable, createUserTable } from "../db/migration.ts";
import {
  getSettingsById,
  insertSettings,
  updateSettings,
} from "../models/settings.ts";
import { insertUser } from "../models/user.ts";
import { User } from "../types/types.ts";
import { Settings } from "../types/types.ts";
import { assertObjectMatch } from "@std/assert/object-match";
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

const testSettings: Settings = {
  userId: 12345,
  storeMentalHealthInfo: false,
};

Deno.test("Test insertSettings()", async () => {
  await createUserTable(testDbFile);
  await createSettingsTable(testDbFile);
  insertUser(testUser, testDbFile);

  const queryResult = insertSettings(testUser.telegramId, testDbFile);

  assertEquals(queryResult?.changes, 1);
  assertEquals(queryResult?.lastInsertRowid, 1);

  await Deno.removeSync(testDbFile);
});

Deno.test("Test getSettingsById()", async () => {
  await createUserTable(testDbFile);
  await createSettingsTable(testDbFile);
  insertUser(testUser, testDbFile);
  insertSettings(testUser.telegramId, testDbFile);

  const settings = getSettingsById(testUser.telegramId, testDbFile);

  assertObjectMatch(settings!, testSettings);

  await Deno.removeSync(testDbFile);
});
Deno.test("Test updateSettings()", async () => {
  await createUserTable(testDbFile);
  await createSettingsTable(testDbFile);
  insertUser(testUser, testDbFile);
  insertSettings(testUser.telegramId, testDbFile);

  const settings = testSettings;

  settings.storeMentalHealthInfo = true;

  const queryResult = updateSettings(
    testUser.telegramId,
    settings,
    testDbFile,
  );

  assertEquals(queryResult?.changes, 1);
  assertEquals(queryResult?.lastInsertRowid, 0);

  await Deno.removeSync(testDbFile);
});
