async function getFiles(uuid) {
  console.log(uuid);
  return {a: uuid};
}

module.exports = async (req, res) => {
  res.send(await getFiles(req.query.projectId));
}
