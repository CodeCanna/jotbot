import {
  AnxietySeverity,
  DepressionSeverity,
  Entry,
  GAD7Score,
  PHQ9Score,
} from "../types/types.ts";
import {
  anxietyExplanations,
  depressionExplanations,
} from "../constants/strings.ts";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function entryFromString(entryString: string): Entry {
  try {
    const emotion = entryString.match(
      /(?<=Emotion)[\S\s]*(?=Emotion Description)/,
    )?.toString().trim();
    const emotionDescription = entryString.match(
      /(?<=Emotion Description)[\S\s]*(?=Situation)/,
    )?.toString().trim();
    const situation = entryString.match(
      // /(?<=Situation[\S\s]*).*(?=[\S\s]*Automatic Thoughts)/,
      /(?<=Situation)[\S\s]*(?=Automatic Thoughts)/,
    )?.toString().trim();
    const automaticThoughts = entryString.match(
      // /(?<=Automatic Thoughts[\S\s]*).*(?=[\S\s]*Page.*)/,
      /(?<=Automatic Thoughts)[\S\s]*(?=Page.*)/,
    )?.toString().trim();
    const emotionArr = emotion!.split(" ");
    const emotionName = emotionArr[0], emotionEmoji = emotionArr[1];

    console.log(emotionArr);

    return {
      userId: 0,
      timestamp: 0,
      emotion: {
        emotionName: emotionName,
        emotionEmoji: emotionEmoji,
        emotionDescription: emotionDescription!,
      },
      situation: situation!,
      automaticThoughts: automaticThoughts!,
      selfiePath: null,
    };
  } catch (err) {
    throw new Error(`Failed to build entry from string: ${err}`);
  }
}

// export async function dropOrphanedSelfies() {
//   const entries = getAllEntriesByUserId();
//   const selfiePaths: string[] = [];
//   for (const entry in entries) {
//     if (!entries[entry].selfiePath) continue;
//     selfiePaths.push(entries[entry].selfiePath!);
//   }

//   const dateTimes: string[][] = [];
//   for (const path in selfiePaths) {
//     const date = selfiePaths[path].split("_")[1];
//     const time = selfiePaths[path].split("_")[2];
//     const dateTime = [];
//     dateTime.push(date, time);
//     dateTimes.push(dateTime);
//   }

//   const dateTimeStrings = [];
//   for (const dateTime in dateTimes) {
//     dateTimeStrings.push(new RegExp(dateTimes[dateTime].join("_")));
//   }

//   for await (const dirEntry of Deno.readDir("assets/selfies")) {
//     for (const regex in dateTimeStrings) {
//       if (!dateTimeStrings[regex].test(dirEntry.name)) {
//         Deno.remove(`assets/selfies/${dirEntry.name}`);
//       }
//     }
//   }
// }

export function entryToString(entry: Entry): string {
  return `
<b>Date Created</b> ${new Date(entry.timestamp!).toLocaleString()}
${
    entry.lastEditedTimestamp
      ? new Date(entry.lastEditedTimestamp).toLocaleString()
      : ""
  }
<b><u>Emotion</u></b>
${entry.emotion.emotionName} ${entry.emotion.emotionEmoji || ""}
  // Show first entry in list
<b><u>Emotion Description</u></b>
${entry.emotion.emotionDescription}

<b><u>Situation</u></b>
${entry.situation}

<b><u>Automatic Thoughts</u></b>
${entry.automaticThoughts}
`;
}

export function calcPhq9Score(
  score: number,
  impactQuestionAnswer: string,
): PHQ9Score {
  let depressionSeverity: DepressionSeverity;
  let depressionExplanation: string;

  if (score <= 4) {
    depressionSeverity = DepressionSeverity.NONE_MINIMAL;
    depressionExplanation = depressionExplanations.none_minimal;
  } else if (score <= 9) {
    depressionSeverity = DepressionSeverity.MILD;
    depressionExplanation = depressionExplanations.mild;
  } else if (score <= 14) {
    depressionSeverity = DepressionSeverity.MODERATE;
    depressionExplanation = depressionExplanations.moderate;
  } else if (score <= 19) {
    depressionSeverity = DepressionSeverity.MODERATELY_SEVERE;
    depressionExplanation = depressionExplanations.moderately_severe;
  } else if (score <= 27) {
    depressionSeverity = DepressionSeverity.SEVERE;
    depressionExplanation = depressionExplanations.severe;
  } else {
    console.log("Depression Score out of bounds!");
  }

  return {
    id: 0,
    userId: 0,
    score: score,
    severity: depressionSeverity!,
    action: depressionExplanation!,
    impactQuestionAnswer: impactQuestionAnswer,
    timestamp: new Date(Date.now()),
  };
}

export function calcGad7Score(
  score: number,
  impactQestionAnswer: string,
): GAD7Score {
  let anxietySeverity: AnxietySeverity;
  let anxietyExplanation: string;

  if (score <= 4) {
    anxietySeverity = AnxietySeverity.MINIMAL_ANXIETY;
    anxietyExplanation = anxietyExplanations.minimal_anxiety;
  } else if (score <= 9) {
    anxietySeverity = AnxietySeverity.MILD_ANXIETY;
    anxietyExplanation = anxietyExplanations.mild_anxiety;
  } else if (score <= 14) {
    anxietySeverity = AnxietySeverity.MODERATE_ANXIETY;
    anxietyExplanation = anxietyExplanations.moderate_anxiety;
  } else if (score <= 21) {
    anxietySeverity = AnxietySeverity.MODERATE_TO_SEVERE_ANXIETY;
    anxietyExplanation = anxietyExplanations.severe_anxiety;
  } else {
    console.log("Depression Score out of bounds!");
  }

  return {
    id: 0,
    userId: 0,
    timestamp: Date.now(),
    score: score,
    severity: anxietySeverity!,
    action: anxietyExplanation!,
    impactQuestionAnswer: impactQestionAnswer,
  };
}
