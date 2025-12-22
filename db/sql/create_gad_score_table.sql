-- GAD-7 Score Table
CREATE TABLE IF NOT EXISTS gad_score_db (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER UNIQUE,
    timestamp INTEGER NOT NULL,
    score INTEGER NOT NULL,
    severity TEXT NOT NULL,
    impact TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES user_db(telegramId) ON DELETE CASCADE
);