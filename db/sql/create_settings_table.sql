-- Settings Table
CREATE TABLE IF NOT EXISTS settings_db (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    storeMentalHealthInfo INTEGER DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES user_db(telegramId) ON DELETE CASCADE
);