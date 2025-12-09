export type Entry = {
    id?: number,
    userId: number,
    timestamp: number,
    mood: Mood,
    situation: string,
    automaticThoughts: string,
    selfiePath?: string
};

export type Mood = {
    moodName: string,
    moodEmoji: string,
    moodDescription: string
}

export type User = {
    id?: number,
    telegramId: number,
    username: string,
    dob: Date,
}