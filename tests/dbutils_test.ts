import { assertEquals } from "@std/assert/equals";
import { testDbFile, testDbFileBasePath } from "../constants/paths.ts";
import { createUserTable } from "../db/migration.ts";
import { insertUser } from "../models/user.ts";
import { User } from "../types/types.ts";
import { getLatestId } from "../utils/dbUtils.ts";
import { existsSync } from "node:fs";

// Create test db directory structure
if (!existsSync(testDbFileBasePath)) {
  Deno.mkdirSync(testDbFileBasePath, { recursive: true });
}

Deno.test("Test getLatestId()", () => {
  const testUser: User = {
    telegramId: 12345,
    username: "Test",
    dob: new Date(Date.now()),
    joinedDate: new Date(Date.now()),
  };
  createUserTable(testDbFile);
  insertUser(testUser, testDbFile);
  assertEquals(getLatestId(testDbFile, "user_db"), 1);
  Deno.removeSync(testDbFile);
});
