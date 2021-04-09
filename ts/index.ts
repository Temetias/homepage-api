// DOTENV ////////////////////////////////////////

import dotenv from "dotenv";
dotenv.config();

// DEPS //////////////////////////////////////////

import path from "path";
import express from "express";
import cors from "cors";
import { json } from "body-parser";

// APIS //////////////////////////////////////////

import twitch from "./api/twitch";
import analytics from "./api/analytics";
import { sendError } from "./utils";

// BOOTSTRAP /////////////////////////////////////

const app = express();
app.set("trust proxy", true);
app.use(cors());
app.use(json());

app.use("/static", express.static(path.join(__dirname, "../images")));

const twitchStatus = twitch(app);
const analyticsStatus = analytics(app);

app.get("/", async (_, res) =>
  res.status(200).json({
    twitch: await twitchStatus(),
    analytics: await analyticsStatus(),
  })
);

app.get("*", (_, res) => sendError(404, res));

app.listen(process.env.PORT || 8080, () =>
  console.log(`Server running at http://localhost:${process.env.PORT}`)
);
