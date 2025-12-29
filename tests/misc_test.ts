import { assertEquals, assertObjectMatch } from "@std/assert";
import { entryFromString, entryToString } from "../utils/misc.ts";
import { Entry } from "../types/types.ts";
import { testDbFileBasePath } from "../constants/paths.ts";
import { existsSync } from "node:fs";

// Create test db directory structure
if (!existsSync(testDbFileBasePath)) {
  Deno.mkdirSync(testDbFileBasePath, { recursive: true });
}

Deno.test("Test entryFromString()", () => {
  const testEntryString = `Page 1 of 15

Date Created 12/16/2025, 12:00:00 AM
Last Edited 12/16/2025, 4:43:58 AM
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
  assertObjectMatch(entryFromString(testEntryString), testEntry);
});

Deno.test("Test entryToString()", () => {
  const testEntryString = `<b>Date Created</b> ${new Date(0).toLocaleString()}
<b>Last Edited</b> ${new Date(0).toLocaleString()}
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
  assertEquals(entryToString(testEntry), testEntryString);
});
