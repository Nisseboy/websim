const { Pool } = require("pg");
let pool;

async function saveFiles(req, res) {
  let token = req.cookies.token;
  let files = req.body.files;

  await insertRows();

  return "jaaaas queen";
}

const insertRows = async () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    pool = new Pool({
      connectionString,
      max: 1
    });
  }
  const client = await pool.connect();
  try {
    await client.query("INSERT INTO table (col1, col2) VALUES (val1, val2)");
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
