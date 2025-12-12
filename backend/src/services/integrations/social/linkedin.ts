import axios from "axios";
import { SocialCredentials } from "./credentials";

export const LinkedInService = {
  async publish({ title, content, url, imageUrl }: any) {
    const creds = await SocialCredentials.get("linkedin");

    if (!creds?.access_token) {
      throw new Error("LinkedIn is not connected.");
    }

    const author = `urn:li:person:${creds.client_id}`;

    const payload = {
      author,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: `${title}\n\n${content}\n\n${url}`
          },
          shareMediaCategory: imageUrl ? "IMAGE" : "NONE",
          media: imageUrl
            ? [
                {
                  status: "READY",
                  description: { text: title },
                  media: imageUrl,
                  title: { text: title }
                }
              ]
            : []
        }
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
    };

    const response = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      payload,
      {
        headers: {
          Authorization: `Bearer ${creds.access_token}`,
          "X-Restli-Protocol-Version": "2.0.0",
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  }
};
