import { assertEquals } from "@std/assert";
import { entryFromString } from "../utils/misc.ts";
import { Entry } from "../types/types.ts";

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
