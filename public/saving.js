let owner = document.location.pathname.split("/")[2];
document.cookie = `owner=${owner};path=/`;

function ssave() {
  root.iterate(file=>{
    file.code = file.tempCode;
    file.saved = true;
  });

  let state = {
    root: root,
    editors: [
      {
        currentFile: editors[0].currentFile,
        opened: editors[0].opened
      },
      {
        currentFile: editors[1].currentFile,
        opened: editors[1].opened
      },
    ],
    selectedFile: selectedFile
  };
  localStorage.setItem("state", JSON.stringify(state));

  renderFiles();
}

function sload() {
  let state = JSON.parse(localStorage.getItem("state"));
  if (state == null) return;

  root = restoreFile(state.root);
  rectify();

  selectedFile = state.selectedFile;

  if (state.editors[0].currentFile)
    changeFile(fromPath(state.editors[0].currentFile), 0);
  editors[0].opened = state.editors[0].opened;

  if (state.editors[1].currentFile)
    changeFile(fromPath(state.editors[1].currentFile), 1);
  editors[1].opened = state.editors[1].opened;

  renderFiles();
}



async function save() {
  root.iterate(file=>{
    file.code = file.tempCode;
    file.saved = true;
  });

  let sendFiles = root.simplify();

  let res = await fetch(window.location.origin + "/postfiles/", {
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

  console.log(res.status);

  if (res.status == "No files") {
    root = new Files("ROOT").addChildren([
      new Files("testProj").addChildren([
        new Files("index.html", ""),
        new Files("index.js", ""),
        new Files("style.css", ""),
      ])
    ]);
  } else if (res.status == "No such user") {
    popup("That user does not exist", 10000);

    return;
  }


  renderFiles();
}
