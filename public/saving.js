function save() {
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

function load() {
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




async function serverSave() {
  let val = fetch("api/uploadFiles", {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      a: 3
    })
  });

  console.log(val);
}
function serverLoad() {

}
