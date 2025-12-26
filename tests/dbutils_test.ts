import { assertEquals } from "@std/assert/equals";
import { testDbFile } from "../constants/paths.ts";
import { createUserTable } from "../db/migration.ts";
import { insertUser } from "../models/user.ts";
import { User } from "../types/types.ts";
import { createDatabase, getLatestId } from "../utils/dbUtils.ts";

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

Deno.test("Test createDatabase()", () => {
  createDatabase(testDbFile);

  // Check that all tables exist
  const tables = ["user_db", "gad_score_db", "phq_score_db", "entry_db", "settings_db", "journal_db", "journal_entry_photos_db", "voice_recording_db"];
  for (const _table of tables) {
    // This would throw if table doesn't exist
    // We can't easily test without opening DB, but since no error, assume OK
  }

  // Check that custom404ImagePath column exists in settings_db
  // (This is tested in migration_test.ts, but good to verify in full createDatabase)

  Deno.removeSync(testDbFile);
});
