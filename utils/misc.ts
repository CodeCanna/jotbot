import { Entry } from "../types/types.ts";
import { getAllEntriesByUserId } from "../models/entry.ts";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

export async function dropOrphanedSelfies() {
  const entries = getAllEntriesByUserId(779473861);
  const selfiePaths: string[] = [];
  for (const entry in entries) {
    if (!entries[entry].selfiePath) continue;
    selfiePaths.push(entries[entry].selfiePath!);
  }

  const dateTimes: string[][] = [];
  for (const path in selfiePaths) {
    const date = selfiePaths[path].split("_")[1];
    const time = selfiePaths[path].split("_")[2];
    const dateTime = [];
    dateTime.push(date, time);
    dateTimes.push(dateTime);
  }

  const dateTimeStrings = [];
  for (const dateTime in dateTimes) {
    dateTimeStrings.push(new RegExp(dateTimes[dateTime].join("_")));
  }

  for await (const dirEntry of Deno.readDir("assets/selfies")) {
    for (const regex in dateTimeStrings) {
      if (!dateTimeStrings[regex].test(dirEntry.name)) Deno.remove(`assets/selfies/${dirEntry.name}`);
    }
  }
}

export function entryToString(entry: Entry): string {
  return `
<b>Date Created</b> ${
    new Date(entry.timestamp).toLocaleString()
  }
${entry.lastEditedTimestamp ? new Date(entry.lastEditedTimestamp).toLocaleString() : ""}
<b><u>Emotion</u></b>
${entry.emotion.emotionName} ${
    entry.emotion.emotionEmoji || ""
  }
  // Show first entry in list
<b><u>Emotion Description</u></b>
${entry.emotion.emotionDescription}

<b><u>Situation</u></b>
${entry.situation}

<b><u>Automatic Thoughts</u></b>
${entry.automaticThoughts}
`;
}
