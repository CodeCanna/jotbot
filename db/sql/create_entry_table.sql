-- Entry Table
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
    FOREIGN KEY (userId) REFERENCES user_db(telegramId) ON DELETE CASCADE
);