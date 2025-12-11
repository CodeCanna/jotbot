import { DatabaseSync } from "node:sqlite";

export function createEntryTable() {
  try {
    const db = new DatabaseSync("db/jotbot.db");
    db.exec("PRAGMA foreign_keys = ON;");
    db.prepare(`
        CREATE TABLE IF NOT EXISTS entry_db (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            timestamp INTEGER NOT NULL,
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
    console.log(`Failed to create entry_db table: ${err}`);
  }
}

export function createUserTable() {
    try {
        const db = new DatabaseSync("db/jotbot.db");
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
        console.log(`There was a a problem create the user_db table: ${err}`);
    }
}
