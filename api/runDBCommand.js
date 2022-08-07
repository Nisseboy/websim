const { Pool } = require("pg");
let pool;


const run = async (req, res) => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    pool = new Pool({
      connectionString,
      max: 1
    });
  }
  const client = await pool.connect();
  try {
    await client.query(req.body.command);
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.release();
  }
}



module.exports = async (req, res) => {
  try {
    res.send(await run(req, res));
  } catch (err) {
    res.send(err);
  }
}
