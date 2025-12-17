import { assertEquals, assertExists } from "@std/assert";
import { KittyEngine } from "../utils/KittyEngine.ts";

Deno.test("Test getRandomKitty()", async () => {
  const kittyEngine = new KittyEngine();
  const kittyJson = await kittyEngine.getRandomKitty();
  assertExists(kittyJson.id);
});

Deno.test("Test getSpecificKitty()", async () => {
  const kittyEngine = new KittyEngine("cute,black");
  const kittyJson = await kittyEngine.getSpecificKitty();
  assertExists(kittyJson.id);
});

Deno.test("Test getRandomKittyGif()", async () => {
  const kittyEngine = new KittyEngine();
  const kittyJson = await kittyEngine.getRandomKittyGif();
  assertExists(kittyJson.id);
});

Deno.test("Test getKittySays()", async () => {
    const kittyEngine = new KittyEngine();
    const kittyJson = await kittyEngine.getKittySays("This is a Test!");
    assertExists(kittyJson.id);
});
