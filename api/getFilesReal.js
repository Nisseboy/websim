const mime = require("mime-types");
const { Pool } = require("pg");
let pool;

async function theWholeShabang(req, res) {
  console.log(req);
  res.send({a: "penus"});
  return;

  let uuid = req.cookies.uuid;
  let path = req.body.path

  let response = await getFiles(uuid);

  return {res: response};
}

const getFiles = async (uuid) => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    pool = new Pool({
      connectionString,
      max: 1
    });
  }
  const client = await pool.connect();
  try {
    let res = await client.query("select files from users where id = '" + uuid + "'");
    return res.rows[0];
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.release();
  }
}

app.get("/previewServer/*", (req, res) => {
  let file = req.url.split("/previewServer/")[1];
  if (users[req.cookies.token])
    sendSpoofFile(res, file, users[req.cookies.token].files[file]);
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

app.get("/previewServer/*", (req, res) => {
  let file = req.url.split("/previewServer/")[1];
  if (users[req.cookies.token])
    sendSpoofFile(res, file, users[req.cookies.token].files[file]);
});



module.exports = async (req, res) => {
  theWholeShabang(req, res);
}
