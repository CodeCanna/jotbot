import { assertEquals } from "@std/assert";
import { entryFromString, entryToString } from "../utils/misc.ts";
import { Entry, GAD7Score } from "../types/types.ts";
import test from "node:test";

Deno.test("Test entryFromString()", () => {
  const testEntryString = `Page 1 of 15

Date Created 12/16/2025, 4:32:34 PM
Last Edited 12/16/2025, 4:43:58 PM
Emotion
Test 😌

Emotion Description
Test Entry

Situation
Test Entry

Automatic Thoughts
Test Entry

Page 1 of 15`;
  const testEntry: Entry = {
    userId: 0,
    timestamp: 0,
    emotion: {
      emotionName: "Test",
      emotionEmoji: "😌",
      emotionDescription: "Test Entry",
    },
    situation: "Test Entry",
    automaticThoughts: "Test Entry",
    selfiePath: null,
  };

  // entryFromString(testEntryString);

  assertEquals(entryFromString(testEntryString), testEntry);
});

Deno.test("Test entryToString()", () => {
  const testEntryString = `<b>Date Created</b> 12/31/1969, 5:00:00 PM
<b>Last Edited</b> 12/31/1969, 5:00:00 PM
<b><u>Emotion</u></b>
Test 😌

<b><u>Emotion Description</u></b>
Test Entry

<b><u>Situation</u></b>
Test Entry

<b><u>Automatic Thoughts</u></b>
Test Entry`;

  const testEntry: Entry = {
    userId: 0,
    timestamp: 0,
    lastEditedTimestamp: 0,
    emotion: {
      emotionName: "Test",
      emotionEmoji: "😌",
      emotionDescription: "Test Entry",
    },
    situation: "Test Entry",
    automaticThoughts: "Test Entry",
    selfiePath: null,
  };
  console.log(entryToString(testEntry));
  assertEquals(entryToString(testEntry), testEntryString);
});

// Deno.test("Test calcGad7Score()", () => {
//   const testScores: GAD7Score[] = [
//     {
//       id: 0,
//       userId: 0,
//       timestamp: 0,
//       score: 4,
//       severity: AnxietySeverity.MINIMAL_ANXIETY,
//       impactQuestionAnswer: ""
//     }
//   ];

//   for (const score in testScores) {

//   }
// })
