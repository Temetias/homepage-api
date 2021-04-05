import express from "express";

export type ApiInitializer = (app: express.Express) => () => Promise<boolean>;
