import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import { ApiInitializer } from "../types";
import { sendError } from "../utils";

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
  ) => Promise<T> | T
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
        collection.insertOne({
          ...req.body,
          ip: req.ip,
          ips: req.ips,
          visitTime: 0,
          timestamp: Date.now(),
        })
      )
        .then(({ insertedId }) => res.status(200).send(insertedId))
        .catch(() => sendError(500, res));
    }
  );

  app.get(`/${MASKED_ANALYTICS_NAME}/ping`, (req, res) => {
    connectAndDo((collection) => {
      req.query.id && req.query.time
        ? collection
            .updateOne(
              { _id: new ObjectId(req.query.id as string) },
              { $set: { visitTime: req.query.time } }
            )
            .then(({ upsertedId }) => res.status(200).send(upsertedId))
        : sendError(400, res);
    }).catch(() => sendError(500, res));
  });

  app.get("/analytics/getEntries", (_, res) => {
    connectAndDo((collection) => {
      collection.find({}).toArray((err, result) => {
        err
          ? sendError(500, res)
          : res.status(200).send(JSON.stringify(result));
      });
    });
  });

  return async () => {
    try {
      await connectAndDo(() => {});
      return true;
    } catch (_) {
      return false;
    }
  };
};

export default initialize;
