async function saveFiles(req, res) {
  res.send(req.body);
}



module.exports = async (req, res) => {
  try {
    res.send(await saveFiles(req, res));
  } catch (err) {
    res.send(err);
  }
}
