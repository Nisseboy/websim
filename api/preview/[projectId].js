async function getFiles(projectId) {
  console.log(projectId);
  return res.send({a: projectId});
}

module.exports = async (req, res) => {
  res.send(await getFiles(req.query.projectId));
}
