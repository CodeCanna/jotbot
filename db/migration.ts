import { PathLike } from "node:fs";
import { DatabaseSync } from "node:sqlite";

export function createEntryTable(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    db.exec("PRAGMA foreign_keys = ON;");
    db.prepare(`
      CREATE TABLE IF NOT EXISTS entry_db (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        lastEditedTimestamp INTEGER,
        situation TEXT NOT NULL, 
        automaticThoughts TEXT NOT NULL,
        emotionName TEXT NOT NULL,
        emotionEmoji TEXT,
        emotionDescription TEXT NOT NULL,
        selfiePath TEXT,
        FOREIGN KEY (userId) REFERENCES user_db(telegramId)
        ON DELETE CASCADE
      );
    `).run();
    db.close();
  } catch (err) {
    console.error(`Failed to create entry_db table: ${err}`);
  }
}

export function createGadScoreTable(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    db.exec("PRAGMA foreign_keys = ON;");
    db.prepare(`
      CREATE TABLE IF NOT EXISTS gad_score_db (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER UNIQUE,
        timestamp INTEGER NOT NULL,
        score INTEGER NOT NULL,
        severity TEXT NOT NULL,
        impact TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES user_db(telegramId)
        ON DELETE CASCADE
      );
    `).run();
    db.close();
  } catch (err) {
    console.error(`There was a a problem create the user_db table: ${err}`);
  }
}

export function createPhqScoreTable(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    db.exec("PRAGMA foreign_keys = ON;");
    db.prepare(`
      CREATE TABLE IF NOT EXISTS phq_score_db (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER UNIQUE,
        timestamp INTEGER NOT NULL,
        score INTEGER NOT NULL,
        severity TEXT NOT NULL,
        action TEXT NOT NULL,
        impact TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES user_db(telegramId)
        ON DELETE CASCADE
      );
    `).run();
    db.close();
  } catch (err) {
    console.error(`There was a a problem create the user_db table: ${err}`);
  }
}

export function createUserTable(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    db.exec("PRAGMA foreign_keys = ON;");
    db.prepare(`
      CREATE TABLE IF NOT EXISTS user_db (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegramId INTEGER UNIQUE,
        username TEXT NOT NULL UNIQUE,
        dob INTEGER NOT NULL,
        joinedDate INTEGER NOT NULL
      );
    `).run();
    db.close();
  } catch (err) {
    console.error(`There was a a problem create the user_db table: ${err}`);
  }
}

export function createSettingsTable(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    db.exec("PRAGMA foreign_keys = ON;");
    db.prepare(`
      CREATE TABLE IF NOT EXISTS settings_db (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        storeMentalHealthInfo INTEGER DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES user_db(telegramId)
        ON DELETE CASCADE
      );
    `).run();
    db.close();
  } catch (err) {
    console.error(`Failed to create settings table: ${err}`);
  }
}

export function createJournalTable(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    db.exec("PRAGMA foreign_keys = ON;");
    db.prepare(`
      CREATE TABLE IF NOT EXISTS journal_db (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        lastEditedTimestamp INTEGER,
        content TEXT NOT NULL,
        length INTEGER NOT NULL,
        images TEXT,
        voiceRecordings TEXT,
        FOREIGN KEY (userId) REFERENCES user_db(telegramId)
        ON DELETE CASCADE
      );
    `).run();
    db.close();
  } catch (err) {
    console.error(`Failed to create settings table: ${err}`);
  }
}
