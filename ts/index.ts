// DOTENV ////////////////////////////////////////

import dotenv from "dotenv";
dotenv.config();

// DEPS //////////////////////////////////////////

import express from "express";
import cors from "cors";
import { json } from "body-parser";

// APIS //////////////////////////////////////////

import twitch from "./api/twitch";
import analytics from "./api/analytics";

// BOOTSTRAP /////////////////////////////////////

const app = express();
app.use(cors());
app.use(json());

const twitchStatus = twitch(app);
const analyticsStatus = analytics(app);

app.get("/", async (_, res) =>
  res.send({
    twitch: await twitchStatus(),
    analytics: await analyticsStatus(),
  })
);

app.listen(process.env.PORT || 8080, () =>
  console.log(`Server running at https://localhost:${process.env.PORT}`)
);
