import { assertEquals } from "@std/assert/equals";
import { testDbFile } from "../constants/paths.ts";
import { createPhqScoreTable, createUserTable } from "../db/migration.ts";
import { getPhqScoreByUserId, insertPhqScore } from "../models/phq9_score.ts";
import { insertUser } from "../models/user.ts";
import { DepressionSeverity, PHQ9Score, User } from "../types/types.ts";
import { assertObjectMatch } from "@std/assert/object-match";

// Create test user
const testUser: User = {
  telegramId: 12345,
  username: "username",
  dob: new Date(),
  joinedDate: new Date(),
};

const testPhqScore: PHQ9Score = {
  id: 1,
  userId: 12345,
  timestamp: 0,
  score: 0,
  severity: DepressionSeverity.NONE_MINIMAL,
  action: "Test Action",
  impactQuestionAnswer: "Test Impact Answer",
};

Deno.test("Test insertPhqScore()", async () => {
  createUserTable(testDbFile);
  createPhqScoreTable(testDbFile);
  insertUser(testUser, testDbFile);

  const queryResult = insertPhqScore(testPhqScore, testDbFile);

  assertEquals(queryResult?.changes, 1);
  assertEquals(queryResult?.lastInsertRowid, 1);

  await Deno.removeSync(testDbFile);
});

Deno.test("Test getPhqScoreById()", async () => {
  await createUserTable(testDbFile);
  await createPhqScoreTable(testDbFile);
  insertUser(testUser, testDbFile);
  insertPhqScore(testPhqScore, testDbFile);

  const score = getPhqScoreByUserId(testPhqScore.userId, testDbFile);

  assertObjectMatch(score!, testPhqScore);
  await Deno.removeSync(testDbFile);
});
