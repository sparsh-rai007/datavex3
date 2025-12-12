import { LinkedInService } from "./linkedin";
import { RedditService } from "./reddit";
import { InstagramService } from "./instagram";

export const SocialPublisher = {
  async publishToPlatforms({ platforms, title, content, url, imageUrl }: any) {
    const results: any = {};

    for (const platform of platforms) {
      try {
        if (platform === "linkedin") {
          results.linkedin = await LinkedInService.publish({
            title,
            content,
            url,
            imageUrl
          });
        }

        if (platform === "reddit") {
          results.reddit = await RedditService.publish({
            title,
            content,
            url
          });
        }

        if (platform === "instagram") {
          results.instagram = await InstagramService.publish({
            caption: `${title}\n\n${content}`,
            imageUrl
          });
        }
      } catch (err: any) {
        results[platform] = { error: err.message };
      }
    }

    return results;
  }
};
