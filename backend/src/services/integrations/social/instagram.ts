import axios from "axios";
import { SocialCredentials } from "./credentials";

export const InstagramService = {
  async publish({ caption, imageUrl }: any) {
    const creds = await SocialCredentials.get("instagram");

    if (!creds?.access_token || !creds?.ig_user_id) {
      throw new Error("Instagram is not connected.");
    }

    // STEP 1 — Create media container
    const containerRes = await axios.post(
      `https://graph.facebook.com/v18.0/${creds.ig_user_id}/media`,
      {
        image_url: imageUrl,
        caption,
        access_token: creds.access_token
      }
    );

    const containerId = containerRes.data.id;

    // STEP 2 — Publish container
    const publishRes = await axios.post(
      `https://graph.facebook.com/v18.0/${creds.ig_user_id}/media_publish`,
      {
        creation_id: containerId,
        access_token: creds.access_token
      }
    );

    return publishRes.data;
  }
};
