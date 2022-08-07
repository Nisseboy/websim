async function theWholeShabang(req, res) {
  console.log(JSON.stringify(req));
  res.send({a: "penus"});
  return;
}

module.exports = async (req, res) => {
  theWholeShabang(req, res);
}
