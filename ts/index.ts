// DOTENV ////////////////////////////////////////

import dotenv from "dotenv";
dotenv.config();

// DEPS //////////////////////////////////////////

import { Api } from "./types";
import express from "express";
import cors from "cors";

// APIS //////////////////////////////////////////

import TWITCH_API from "./api/twitch";

// BOOTSTRAP /////////////////////////////////////

// Add new APIs here
const APIS: Api[] = [TWITCH_API];

const app = express();
app.use(cors());

// Bundles APIs to /[api]/[endpoint] -structure.
APIS.forEach(({ name, endpoints }) =>
  endpoints.forEach(([path, callback]) => app.get(`/${name}${path}`, callback))
);

// Bundles status page into a simple name+boolean record.
app.get("/", async (_, res) => {
  const apiStatuses: Record<string, boolean> = {};
  for (const { name, statusCallback } of APIS) {
    apiStatuses[name] = await statusCallback();
  }
  res.send(apiStatuses);
});

app.listen(process.env.PORT || 8080, () =>
  console.log(`Server running at https://localhost:${process.env.PORT}`)
);
