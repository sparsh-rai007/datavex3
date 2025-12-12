import { pool } from "../../../db/connection";

export const SocialCredentials = {
  
  // Fetch a single platform's credentials
  async get(platform: string) {
    const result = await pool.query(
      `SELECT * FROM social_credentials WHERE platform = $1 LIMIT 1`,
      [platform]
    );
    return result.rows[0] || null;
  },

  // Fetch ALL credentials in structured format
  async getAll() {
    const result = await pool.query(`SELECT * FROM social_credentials`);
    const rows = result.rows;

    const response: any = {};

    rows.forEach((row) => {
      response[row.platform] = {
        client_id: row.client_id,
        client_secret: row.client_secret,
        access_token: row.access_token,
        refresh_token: row.refresh_token,
        page_id: row.page_id,
        ig_user_id: row.ig_user_id
      };
    });

    return response;
  },

  // Save/update a single platform
  async save(platform: string, data: any) {
    const existing = await this.get(platform);

    if (existing) {
      await pool.query(
        `UPDATE social_credentials
         SET client_id=$1, client_secret=$2, access_token=$3, refresh_token=$4,
             page_id=$5, ig_user_id=$6, updated_at=NOW()
         WHERE platform=$7`,
        [
          data.client_id || null,
          data.client_secret || null,
          data.access_token || null,
          data.refresh_token || null,
          data.page_id || null,
          data.ig_user_id || null,
          platform
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO social_credentials
         (platform, client_id, client_secret, access_token, refresh_token, page_id, ig_user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          platform,
          data.client_id || null,
          data.client_secret || null,
          data.access_token || null,
          data.refresh_token || null,
          data.page_id || null,
          data.ig_user_id || null
        ]
      );
    }

    return true;
  }
};
