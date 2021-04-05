import express from "express";
import { MongoClient } from "mongodb";
import { ApiInitializer } from "../types";

const MASKED_ANALYTICS_NAME = "laskenta"; // Dodging adblockers with a finnish name
const MASKED_ANALYTICS_ENDPOINT = "tapahtuma"; // Dodging adblockers with a finnish name

const DB_ANALYTICS_COLLECTION = "analytics";

const getClient = () => {
  let mongoClient: MongoClient | null = null;
  return mongoClient
    ? mongoClient
    : (() => {
        mongoClient = new MongoClient(process.env.MONGO_URL!);
        return mongoClient;
      })();
};

const connectAndDo = async <T>(
  callback: (
    collection: ReturnType<ReturnType<MongoClient["db"]>["collection"]>
  ) => Promise<T>
) => {
  const client = getClient();
  await client.connect();
  const result = await callback(
    client.db(process.env.MONGO_DB!).collection(DB_ANALYTICS_COLLECTION)
  );
  await client.close();
  return result;
};

const initialize: ApiInitializer = (app: express.Express) => {
  app.post(
    `/${MASKED_ANALYTICS_NAME}/${MASKED_ANALYTICS_ENDPOINT}`,
    (req, res) => {
      connectAndDo((collection) =>
        collection.insertOne({ ...req.body, visitTime: 0 })
      )
        .then(({ insertedId }) => res.status(200).send(insertedId))
        .catch(() => res.status(500).send(":("));
    }
  );

  app.get(`/${MASKED_ANALYTICS_NAME}/ping`, (req, res) => {
    connectAndDo(async (collection) => {
      req.query.id && req.query.time
        ? res
            .status(200)
            .send(
              (
                await collection.updateOne(
                  { id: req.query.id },
                  { visitTime: req.query.time }
                )
              ).upsertedId
            )
        : res.status(400).send(">:(");
    });
  });

  return async () => {
    try {
      await connectAndDo(async () => {});
      return true;
    } catch (_) {
      return false;
    }
  };
};

export default initialize;
