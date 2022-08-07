const express = require("express");
const app = express();
const port = 8080;

const path = require("path");

let users = {};

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public"));
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
