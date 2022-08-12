const express = require("express");
const cookieParser = require("cookie-parser");
const expressValidator = require('express-validator');
const app = express();
const port = 8080;

const path = require("path");

const fs = require("fs");

const pg = require("pg");

const DBTOKEN = process.env.DBTOKEN;
console.log(DBTOKEN);

const client = new pg.Client();
client.connect();
client.query("CREATE TABLE IF NOT EXISTS users (username STRING PRIMARY KEY, password STRING, files STRING);");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public"));
});


app.post("/login", (req, res) => {
  console.log(req.body);
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
