import express from "express";

export type Api = {
  name: string;
  statusCallback: () => Promise<boolean>;
  endpoints: [string, (req: express.Request, res: express.Response) => void][];
};
