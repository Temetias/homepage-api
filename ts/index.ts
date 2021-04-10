// DOTENV ////////////////////////////////////////

import dotenv from "dotenv";
dotenv.config();

// DEPS //////////////////////////////////////////

import path from "path";
import express from "express";
import { json } from "body-parser";
import { sendError } from "./utils";

// APIS //////////////////////////////////////////

import twitch from "./api/twitch";
import analytics from "./api/analytics";

// BOOTSTRAP /////////////////////////////////////

const app = express();
app.set("trust proxy", true);
app.use(json());

app.use("/static", express.static(path.join(__dirname, "../images")));

const twitchStatus = twitch(app);
const analyticsStatus = analytics(app);

app.get("/", async (_, res) => {
  try {
    res.status(200).json({
      twitch: await twitchStatus(),
      analytics: await analyticsStatus(),
    });
  } catch (e) {
    sendError(500, res);
  }
});

app.get("*", (_, res) => sendError(404, res));

app.listen(process.env.PORT || 8080, () =>
  console.log(`Server running at http://localhost:${process.env.PORT}`)
);
