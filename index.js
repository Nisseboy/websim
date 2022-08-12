const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 8080;

const path = require("path");

const fs = require("fs");
const pg = require("pg");

var dbconfig = {
  user: "nisseboy",
  host: "postgresql://nisseboy:T3vBkLOdHXdE_srAF-2W8A@free-tier13.aws-eu-central-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster%3Dwebsim-2787",
  database: "defaultdb",
  port: 26257
};

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public"));
});

app.get("/getFiles", (req, res) => {
  getFiles(req, res);
});

app.post("/postFiles", (req, res) => {
  postFiles(req, res);
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});










function postFiles(req, res) {
  let uuid = req.cookies.uuid;
  let files = req.body.files;

  let payload = `'${uuid}','${JSON.stringify(files)}'`;

  dbcommand(`UPSERT INTO users (id, files) VALUES (${payload})`);
}
function getFiles(req, res) {
  let uuid = req.cookies.uuid;
  let files = users[uuid].files;

  res.send(files);
}

async function dbcommand(command) {
  let pool = await new pg.Pool(dbconfig);
  pool.connect(async function (err, client, done) {
    let finish = function () {
      done();
      process.exit();
    };

    if (err) {
      console.error('Error connecting to the CockroachDB', err);
      finish();
    }

    let res = await client.query('CREATE TABLE IF NOT EXISTS demo (id INT PRIMARY KEY, string_txt TEXT NOT NULL);');
    console.log(res);
  });
}
