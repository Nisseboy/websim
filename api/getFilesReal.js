async function theWholeShabang(req, res) {
  console.log(req);
  res.send({a: "penus"});
  return;
}

module.exports = async (req, res) => {
  theWholeShabang(req, res);
}
