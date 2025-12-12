import axios from "axios";
import { SocialCredentials } from "./credentials";

export const RedditService = {
  async publish({ title, content, url, subreddit = "test" }: any) {
    const creds = await SocialCredentials.get("reddit");

    if (!creds?.access_token) {
      throw new Error("Reddit is not connected.");
    }

    const payload = {
      sr: subreddit,
      title,
      kind: url ? "link" : "self",
      text: content,
      url
    };

    const response = await axios.post(
      "https://oauth.reddit.com/api/submit",
      payload,
      {
        headers: {
          Authorization: `Bearer ${creds.access_token}`,
          "User-Agent": "datavex-bot/1.0"
        }
      }
    );

    return response.data;
  }
};
