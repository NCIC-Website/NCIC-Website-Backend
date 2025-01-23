import express, { Express }from "express";
import bodyParser from "body-parser";

import testRouter from "./routes/test/test.router";

const app: Express = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/test", testRouter);

export default app
