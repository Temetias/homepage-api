import express from "express";

type KnownError = 404 | 400 | 500 | 502;

const ERROR_REASONS = {
  404: "Not found",
  400: "Bad request",
  500: "Server error",
  502: "Bad gateway",
} as Readonly<Record<KnownError, string>>;

const getErrorPage = (code: KnownError) => /* html */ `
  <main style="width: 100vw; height: 100vh; margin: 0; padding: 0; display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <h1 style="display: block;">${code} - ${ERROR_REASONS[code]}</h1>
    <img src="/static/${code}.gif" alt="Funny gif about ${ERROR_REASONS[code]} error"/>
  </main>
`;

export const sendError = (code: KnownError, res: express.Response) =>
  res.status(code).send(getErrorPage(code));
