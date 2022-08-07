async function theWholeShabang(req, res) {
  console.log("penus");
  res.send({a: "penus"});
  return;
}

module.exports = async (req, res) => {
  theWholeShabang(req, res);
}
