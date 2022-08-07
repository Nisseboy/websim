const express = require("express");
const app = express();
const port = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const path = require("path");
const mime = require("mime-types");

let users = {};

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public"));
});

app.get("/previewServer/*", (req, res) => {
  let file = req.url.split("/previewServer/")[1];
  if (users[req.cookies.token])
    sendSpoofFile(res, file, users[req.cookies.token].files[file]);
});


app.post("/uploadFiles", (req, res) => {
  let files = req.body.files;
  let token = req.body.token;

  users[token] = {};
  users[token].files = {};

  for (let i in files) {
    let f = files[i];
    users[token].files[f.path] = f.data;
  }
  res.send("penis");
});


app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});



async function sendSpoofFile(res, name, content) {
  let text = content;

  res.setHeader("Content-type", mime.lookup(name));
  
  if (text.startsWith("data:")) {
    content = Buffer.from(content.split(",")[1], 'base64');
    res.send(content);
  } else {
    res.send(text);
  }
}
