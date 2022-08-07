const { Pool } = require("pg");
let pool;

async function saveFiles(req) {
  let uuid = req.cookies.uuid;

  let response = await insertRows(uuid);

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
    let res = await client.query("select files from users where id = '" + uuid + "')");
    return res;
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.release();
  }
}



module.exports = async (req, res) => {
  try {
    let response = await saveFiles(req, res);
    res.send(response);
  } catch (err) {
    res.send(err);
  }
}
