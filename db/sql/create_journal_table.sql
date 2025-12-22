-- Journal Entry Table
CREATE TABLE IF NOT EXISTS journal_db (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    voiceRecordingsId INTEGER,
    imagesId INTEGER,
    timestamp INTEGER NOT NULL,
    lastEditedTimestamp INTEGER,
    content TEXT NOT NULL,
    length INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES user_db(telegramId) ON DELETE CASCADE
);