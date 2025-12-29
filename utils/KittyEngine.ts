import { catImagesApiBaseUrl } from "../constants/strings.ts";

export class KittyEngine {
  baseUrl: string = catImagesApiBaseUrl;
  tagString?: string;

  constructor(tagString?: string) {
    this.tagString = tagString;
  }

  async getRandomKitty() {
    const response = await fetch(`${this.baseUrl}/cat`, {
      headers: { accept: "application/json" },
    });
    const json = await response.json();
    return json;
  }

  async getSpecificKitty() {
    const response = await fetch(
      `${this.baseUrl}/cat/${
        this.tagString?.toLowerCase().replaceAll(" ", "")
      }`,
      {
        headers: { accept: "application/json" },
      },
    );
    const json = await response.json();
    console.log(
      `${this.baseUrl}/cat/${
        this.tagString?.toLocaleLowerCase().replaceAll(" ", "")
      }`,
    );
    return json;
  }

  async getRandomKittyGif() {
    const response = await fetch(`${this.baseUrl}/cat/gif`, {
      headers: { accept: "application/json" },
    });
    const json = await response.json();
    return json;
  }

  async getKittySays(text: string) {
    const response = await fetch(`${this.baseUrl}/cat/says/${text}`, {
      headers: { accept: "application/json" },
    });
    const json = await response.json();
    return json;
  }

  async getKittySaysFromTags(text: string) {
    const response = await fetch(
      `${this.baseUrl}/cat/${this.tagString}/says/${text}`,
      { headers: { accept: "application/json" } },
    );
    const json = await response.json();
    return json;
  }

  async getCustomizedKittySays(
    text: string,
    fontSize: number,
    fontColor: string,
  ) {
    const response = await fetch(
      `${this.baseUrl}/cat/says/${text}?fontSize=${fontSize}&fontColor=${fontColor}`,
      { headers: { accept: "application/json" } },
    );
    const json = await response.json();
    return json;
  }
}
