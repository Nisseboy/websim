async function saveFiles(req, res) {
  return [req.body, req.cookies];
}



module.exports = async (req, res) => {
  try {
    res.send(await saveFiles(req, res));
  } catch (err) {
    res.send(err);
  }
}
