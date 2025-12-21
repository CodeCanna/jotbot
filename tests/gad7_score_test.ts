import { assertEquals } from "@std/assert";
import { insertGadScore } from "../models/gad7_score.ts";
import { AnxietySeverity, GAD7Score, User } from "../types/types.ts";
import { createGadScoreTable, createUserTable } from "../db/migration.ts";
import { insertUser } from "../models/user.ts";
import { testDbFile } from "../constants/paths.ts";
// Create test user
const testUser: User = {
  telegramId: 12345,
  username: "username",
  dob: new Date(),
  joinedDate: new Date(),
};

// Test gad7 score
const testGadScore: GAD7Score = {
  userId: testUser.telegramId,
  timestamp: 12345,
  score: 10,
  severity: AnxietySeverity.MINIMAL_ANXIETY,
  action: "Test Action",
  impactQuestionAnswer: "Test",
};

Deno.test("Test insertGadScore()", async () => {
  // Create test Database
  createGadScoreTable(testDbFile);
  createUserTable(testDbFile);
  insertUser(testUser, testDbFile);

  const result = insertGadScore(testGadScore, testDbFile);
  assertEquals(result?.changes, 1);

  // Clean up test db
  await Deno.remove(testDbFile);
});
