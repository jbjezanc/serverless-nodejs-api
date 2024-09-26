const serverless = require("serverless-http");
const express = require("express");
const crud = require("./db/crud");
const { getDbClient } = require("./db/clients");
const { validateLead } = require("./db/validators");
const app = express();
const STAGE = process.env.STAGE || "prod";
// return json for all requests
app.use(express.json());

app.get("/", async (req, res, next) => {
  const sql = await getDbClient();
  const now = Date.now();
  const [dbNowResult] = await sql`select now();`;
  const delta = (dbNowResult.now.getTime() - now) / 1000; // seconds
  return res.status(200).json({
    delta: delta,
    stage: STAGE,
  });
});

app.get("/hello", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path!",
  });
});

app.get("/api/leads", async (req, res, next) => {
  const results = await crud.getLeads();
  return res.status(200).json({
    results: results,
  });
});

app.get("/api/leads/:id", async (req, res, next) => {
  const result = await crud.getLead(req.params.id);
  return res.status(200).json({
    result: result,
  });
});

app.post("/api/leads", async (req, res, next) => {
  const postData = await req.body;
  // validation?
  const { data, hasError, message } = await validateLead(postData);

  if (hasError) {
    return res.status(400).json({
      message: message ? message : "Invalid request, please try again",
    });
  } else if (hasError === undefined) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
  const result = await crud.newLead(data);
  // insert data to the database
  return res.status(201).json({
    results: result,
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

// only for server-full app
// app.listen(3000, () => {
//   console.log('Running at http://localhost:3000')
// })

exports.handler = serverless(app);
