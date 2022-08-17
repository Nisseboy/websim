let owner = document.location.pathname.split("/")[2];
document.cookie = `owner=${owner};path=/`;


async function save() {
  root.iterate(file=>{
    file.code = file.tempCode;
    file.saved = true;
  });

  let sendFiles = root.simplify();

  let res = await fetch(window.location.origin + "/postfiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      root: sendFiles
    })
  }).then(a=>a.json());

  if (res.status != "ok") {
    popup(res.status, 1000);
    if (res.status == "Not logged in") {
      requestLogin();
    }
  }

  renderFiles();
}
async function load() {
  res = await fetch(window.location.origin + "/getFiles/").then(a=>a.json());

  if (res.status == "No files") {
    root = new Files("ROOT").addChildren([
      new Files("testProj").addChildren([
        new Files("index.html", ""),
        new Files("index.js", ""),
        new Files("style.css", ""),
      ])
    ]);
  } else if (res.status == "No such user") {
    popup(`User "${owner}" does not exist`, 10000);
    loginDim.style.display = "block";
    hideLogin = ()=>{};
    return;
  } else if (res.status == "ok") {
    let files = res.files;
    root = restoreFile(files);
  }


  renderFiles();
  findNewFile(0);
}
