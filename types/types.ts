export type Entry = {
  id?: number;
  userId: number;
  timestamp: number;
  emotion: Emotion;
  situation: string;
  automaticThoughts: string;
  selfiePath: string | null;
};

export type EntryContent = {
  emotion: Emotion,
  situation: string,
  automaticThoughts: string
}

export type Emotion = {
  emotionName: string;
  emotionEmoji?: string;
  emotionDescription: string;
};

export type User = {
  id?: number;
  telegramId: number;
  username: string;
  dob: Date;
  joinedDate: Date;
};
