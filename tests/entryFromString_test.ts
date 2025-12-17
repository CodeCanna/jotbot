import { assertEquals } from "@std/assert";
import { entryFromString } from "../utils/entryFromString.ts";
import { Entry } from "../types/types.ts";

Deno.test("Test entryFromString()", () => {
  const testEntryString = `Page 1 of 15

Date Created 12/16/2025, 4:32:34 PM
Last Edited 12/16/2025, 4:43:58 PM
Emotion
fdsfsfsfsdfdsfsdfs 

Emotion Description
Nipples

Situation
tj;ljfsdfdsfas

Automatic Thoughts
fdafdfsdfsd

Page 1 of 15`;
  const testEntry: Entry = {
    userId: 0,
    timestamp: 1765927954000,
    emotion: {
      emotionName: "fdsfsfsfsdfdsfsdfs",
      emotionEmoji: "",
      emotionDescription: "Nipples",
    },
    situation: "tj;ljfsdfdsfas",
    automaticThoughts: "fdafdfsdfsd",
    selfiePath: null,
  };

  assertEquals(entryFromString(testEntryString), testEntry);
});
