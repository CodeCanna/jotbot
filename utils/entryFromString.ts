import { Entry } from "../types/types.ts";

export function entryFromString(entryString: string): Entry {
  try {
    const date = entryString.match(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}.*/);
    const emotion = entryString.match(
      /(?<=Emotion\n).*(?=\n\nEmotion Description)/,
    );
    const emotionDescription = entryString.match(
      /(?<=Emotion Description\n).*(?=\n\nSituation)/,
    );
    const situation = entryString.match(
      /(?<=Situation\n).*(?=\n\nAutomatic Thoughts)/,
    );
    const automaticThoughts = entryString.match(
      /(?<=Automatic Thoughts\n).*(?=.*)/,
    );
    const dateObj = new Date(date![0]);
    const emotionArr = emotion![0].split(" ");

    const emotionName = emotionArr[0], emotionEmoji = emotionArr[1];

    return {
      userId: 0,
      timestamp: dateObj.getTime(),
      emotion: {
        emotionName: emotionName,
        emotionEmoji: emotionEmoji,
        emotionDescription: emotionDescription![0],
      },
      situation: situation![0],
      automaticThoughts: automaticThoughts![0],
      selfiePath: null,
    };
  } catch (err) {
    throw new Error(`Failed to build entry from string: ${err}`);
  }
}
