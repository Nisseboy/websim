async function getFiles(projectId) {
  console.log(projectId);
  return {a: projectId};
}

module.exports = async (req, res) => {
  res.send(await getFiles(req.query.projectId));
}
