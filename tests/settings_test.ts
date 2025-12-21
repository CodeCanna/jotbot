import { assertEquals } from "@std/assert/equals";
import { testDbFile } from "../constants/paths.ts";
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
  selfieDirectory: "assets/selfies/",
};

Deno.test("Test insertSettings()", async () => {
  createUserTable(testDbFile);
  createSettingsTable(testDbFile);
  insertUser(testUser, testDbFile);

  const queryResult = insertSettings(testUser.telegramId, testDbFile);

  assertEquals(queryResult?.changes, 1);
  assertEquals(queryResult?.lastInsertRowid, 1);

  await Deno.remove(testDbFile);
});

Deno.test("Test getSettingsById()", async () => {
  createUserTable(testDbFile);
  createSettingsTable(testDbFile);
  insertUser(testUser, testDbFile);
  insertSettings(testUser.telegramId, testDbFile);

  const settings = getSettingsById(testUser.telegramId, testDbFile);

  assertObjectMatch(settings!, testSettings);

  await Deno.remove(testDbFile);
});
Deno.test("Test updateSettings()", async () => {
  createUserTable(testDbFile);
  createSettingsTable(testDbFile);
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

  await Deno.remove(testDbFile);
});
