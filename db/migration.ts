import { PathLike } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { sqlFilePath } from "../constants/paths.ts";

export async function createEntryTable(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    const query =
      (await Deno.readTextFile(`${sqlFilePath}/create_entry_table.sql`)).trim();
    db.exec("PRAGMA foreign_keys = ON;");
    db.prepare(query).run();
    db.close();
  } catch (err) {
    console.error(`Failed to create entry_db table: ${err}`);
  }
}

export async function createGadScoreTable(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    const query =
      (await Deno.readTextFile(`${sqlFilePath}/create_gad_score_table.sql`))
        .trim();
    db.exec("PRAGMA foreign_keys = ON;");
    db.prepare(query).run();
    db.close();
  } catch (err) {
    console.error(`There was a a problem create the user_db table: ${err}`);
  }
}

export async function createPhqScoreTable(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    const query =
      (await Deno.readTextFile(`${sqlFilePath}/create_phq_score_table.sql`))
        .trim();
    db.exec("PRAGMA foreign_keys = ON;");
    db.prepare(query).run();
    db.close();
  } catch (err) {
    console.error(`There was a a problem create the user_db table: ${err}`);
  }
}

export async function createUserTable(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    const query = (await Deno.readTextFile(
      `${sqlFilePath}/create_user_table.sql`,
    )).trim();
    db.exec("PRAGMA foreign_keys = ON;");
    db.prepare(query).run();
    db.close();
  } catch (err) {
    console.error(`There was a a problem create the user_db table: ${err}`);
  }
}

export async function createSettingsTable(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    const query =
      (await Deno.readTextFile(`${sqlFilePath}/create_settings_table.sql`))
        .trim();
    db.exec("PRAGMA foreign_keys = ON;");
    db.prepare(query).run();
    db.close();
  } catch (err) {
    console.error(`Failed to create settings table: ${err}`);
  }
}

export async function createJournalTable(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    const query =
      (await Deno.readTextFile(`${sqlFilePath}/create_journal_table.sql`))
        .trim();
    db.exec("PRAGMA foreign_keys = ON;");
    db.prepare(query).run();
    db.close();
  } catch (err) {
    console.error(`Failed to create settings table: ${err}`);
  }
}

export async function createJournalEntryPhotosTable(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    const query =
      (await Deno.readTextFile(`${sqlFilePath}/create_photo_table.sql`)).trim();
    db.exec("PRAGMA foreign_keys = ON;");
    db.prepare(query).run();
    db.close();
  } catch (err) {
    console.error(`Failed to create settings table: ${err}`);
  }
}

export async function createVoiceRecordingTable(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    const query =
      (await Deno.readTextFile(`${sqlFilePath}/create_voice_recording_table.sql`)).trim();
    db.exec("PRAGMA foreign_keys = ON;");
    db.prepare(query).run();
    db.close();
  } catch (err) {
    console.error(`Failed to create settings table: ${err}`);
  }
}
