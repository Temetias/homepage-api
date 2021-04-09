import axios from "axios";
import express from "express";
import { ApiInitializer } from "../types";
import { sendError } from "../utils";

type TwitchApiAuthResponse = {
  data: {
    access_token: string;
    expires_in: number;
  };
};

const fetchAuthToken = async () =>
  (
    await axios.post<{}, TwitchApiAuthResponse>(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
    )
  ).data;

/**
 * Basic closure over a newly fetched token to avoid repeating unnecessary auth calls.
 *
 * TODO: Maybe keep this "hot" to avoid ever having to wait auth?
 */
const auth = (() => {
  let token: string | null = null;
  const tokenPromise = async () => {
    if (token) {
      return token;
    }
    const { access_token, expires_in } = await fetchAuthToken();
    token = access_token;
    setTimeout(() => (token = null), expires_in);
    return token;
  };
  return async () => (token ? token : await tokenPromise());
})();

/**
 * Gets the status information of the channel provided in .env.
 */
const liveStatus = async (authToken: string) => {
  const { data } = await axios.get(
    `https://api.twitch.tv/helix/search/channels?query=${process.env.TWITCH_USER}`,
    {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  return data.data[0];
};

const initialize: ApiInitializer = (app: express.Express) => {
  app.get("/twitch/livestatus", async (_, res) => {
    try {
      res.status(200).json(await liveStatus(await auth()));
    } catch (e) {
      sendError(502, res);
    }
  });

  return async () => {
    try {
      return !!(await liveStatus(await auth()));
    } catch (_) {
      return false;
    }
  };
};

export default initialize;
