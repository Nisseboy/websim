const { Pool } = require("pg");
let pool;

async function saveFiles(req, res) {
  let uuid = req.cookies.uuid;
  let files = req.body.files;

  await insertRows(uuid, files);

  return {res: "jaaaas queen"};
}

const insertRows = async (uuid, files) => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    pool = new Pool({
      connectionString,
      max: 1
    });
  }
  const client = await pool.connect();
  try {
    let payload = uuid + "," + JSON.stringify(files);

    await client.query("CREATE TABLE IF NOT EXISTS users(id UUID PRIMARY KEY, files STRING)");
    await client.query("UPSERT INTO users (id, files) VALUES (" + payload + ")");
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.release();
  }
}



module.exports = async (req, res) => {
  try {
    res.send(await saveFiles(req, res));
  } catch (err) {
    res.send(err);
  }
}
