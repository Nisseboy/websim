let selectedFile;
let selectedFolder;


class Files {
  constructor(name, code = 1) {
    this.name = name;
    this.code = code;
    this.isFolder = typeof(code) != "string";

    this.isExpanded = true;
    this.hierarchyElement = undefined;
    this.parent = undefined;
    this.children = [];

    this.tempCode = code;
    this.saved = true;

    this.path = name;
  }
  copy(name = this.name) {
    let newFile = new Files(name, this.code);
    for (let i in this.children) {
      newFile.addChild(this.children[i].copy());
    }
    return newFile;
  }
  addChildren(children) {
    if (!this.isFolder) return;

    for (let i in children) {
      this.addChild(children[i]);
    }

    return this;
  }
  addChild(child) {
    if (!this.isFolder) return;

    child.parent = this.path;
    this.children.push(child);

    return this;
  }

  iterate(callback, justFiles = false) {
    if (!this.isFolder || !justFiles)
      callback(this);
    for (let i in this.children) {
      let c = this.children[i];
      c.iterate(callback, justFiles);
    }
  }

  unsave() {
    this.saved = false;
    if (typeof(this.code) == "string")
      this.tempCode = this.code + " ";
    else
      this.tempCode = this.code + 1;
  }

  onClick(e) {
    let elem = this.hierarchyElement;
    if (this.isFolder) {
      this.isExpanded = !this.isExpanded;
      elem.children[1].classList.toggle("hidden");
      elem.children[0].children[2].classList.toggle("rotated");
    } else {
      changeFile(this);
    }
  }

  rightClick(e) {
    let menuOptions = [];
    selectedFile = this.path;
    highlightSelected();
    if (this.isFolder) {
      menuOptions = [
        {text: "New File", callback: ()=>{
          let fileName = prompt("Name of file");
          if (fileName) {
            let file = new Files(fileName, "");
            file.unsave();
            this.addChild(file);

            changeFile(file, currentEditor);
          }
        }},
        {text: "New Folder", callback: ()=>{
          let fileName = prompt("Name of folder");
          if (fileName) {
            let file = new Files(fileName);
            file.unsave();

            this.addChild(file);
            renderFiles();
          }
        }},
        {text: "Upload Files", callback: ()=>{
          document.getElementById("fileDrop").classList.remove("hidden");
          selectedFolder = file.path.split("/")[1];
        }}
      ];
    }

    if (this == root) {
      menuOptions.push({text: "Create from Template", callback: e=>{
        let ops = [];
        for (let i in templates) {
          ops.push({text: templates[i].name, callback: ()=>{
            let file = fromTemplate(templates[i].name, prompt("Name:"));
            file.unsave();
            root.addChild(file);

            renderFiles();
          }});
        }
        createMenu(e.x, e.y, ops);
        e.stopPropagation();
      }});
    }

    menuOptions.push({text: "Rename", callback: ()=>{
      let name = prompt("New Name:");
      if (!name) return;

      let oldPath = this.path;

      this.name = name;
      this.unsave();

      rectify();

      editors[0].opened = editors[0].opened.join("@@@@").replaceAll(oldPath, this.path).split("@@@@");
      editors[1].opened = editors[1].opened.join("@@@@").replaceAll(oldPath, this.path).split("@@@@");
      selectedFile = selectedFile.replace(oldPath, this.path);

      renderFiles();
    }});
    menuOptions.push({text: "Delete", callback: ()=>{
      if (!confirm("Are you sure you want to delete " + this.name)) return;
      closeFile(this, 0);
      closeFile(this, 1);

      let parent = fromPath(this.parent);
      parent.children.splice(parent.children.indexOf(this), 1);

      if (this.isFolder) {
        this.iterate(file=>{
          closeFile(file, 0);
          closeFile(file, 1);
        }, true);
      }
      if (editors[0].currentFile && editors[0].currentFile.startsWith(this.path))
        findNewFile(0);
      if (editors[1].currentFile && editors[1].currentFile.startsWith(this.path))
        findNewFile(1);
      renderFiles();
    }});

    createMenu(e.x, e.y, menuOptions);
  }
}

function restoreFile(empty) {
  let file = new Files(empty.name, empty.code);
  file.isExpanded = empty.isExpanded;
  file.data = empty.data;

  for (let i in empty.children) {
    file.addChild(restoreFile(empty.children[i]));
  }

  return file;
}

function fromPath(path) {
  let result;
  root.iterate(file=>{
    if (file.path == path)
      result = file;
  });
  return result;
}

function rectify(rootFile = root) {
  rootFile.iterate(file=>{
    for (let i in file.children) {
      let c = file.children[i];
      c.path = file.path + "/" + c.name;
      c.parent = file.path;
    }
  });
}

function renderFiles() {
  rectify();

  let hierarchyElement = document.getElementsByClassName("hierarchy")[0];
  hierarchyElement.replaceChildren();
  hierarchyElement.appendChild(renderHelper(root));
  highlightSelected();

  let openElement = document.getElementsByClassName("open")[0];
  openElement.replaceChildren();
  let openElement2 = document.getElementsByClassName("open")[1];
  openElement2.replaceChildren();

  for (let i in editors[0].opened) {
    addOpen(fromPath(editors[0].opened[i]), 0, true);
  }
  for (let i in editors[1].opened) {
    addOpen(fromPath(editors[1].opened[i]), 1, true);
  }
}


function renderHelper(file) {
  let base = document.createElement("div");
  base.classList = "hierarchyBase" + ((file.saved)?"":" unsaved");

  let info = document.createElement("div");
  info.classList = "hierarchyInfo";
  info.style.left = (file.path.split("/").length) * 1.2 + "em";

  let icon = document.createElement("img");
  icon.classList = "hierarchyInfoIcon";
  icon.src = "icons/" + ((file.isFolder)?"folder":((!file.data)?"file":"data")) + ".png";

  let text = document.createElement("div");
  text.classList = "hierarchyInfoText";
  text.innerText = file.name;

  info.appendChild(icon);
  info.appendChild(text);

  if (file.isFolder) {
    let arrow = document.createElement("img");
    arrow.classList = "hierarchyInfoIcon hierarchyInfoArrow " + ((file.isExpanded)?"rotated":"");
    arrow.src = "icons/arrow.png";
    info.appendChild(arrow);
  }

  base.appendChild(info);


  let holder = document.createElement("div");
  holder.className = "hierarchyHolder";
  if (!file.isExpanded)
    holder.classList.add("hidden");

  for (let i in file.children) {
    holder.appendChild(renderHelper(file.children[i]));
  }
  base.appendChild(holder);


  base.addEventListener("click", function(e){
    file.onClick(e);
    e.stopPropagation();
    closeMenu();
  });
  base.addEventListener("contextmenu", function(e){
    file.rightClick(e);
    e.stopPropagation();
    e.preventDefault();
  });


  file.hierarchyElement = base;
  return base;
}

function highlightSelected() {
  root.iterate(file => {
    file.hierarchyElement.classList.remove("selected");
  });

  fromPath(selectedFile).hierarchyElement.classList.add("selected");
}

function getSuffix(name) {
  let suffix = name.split(".");
  return suffix[suffix.length-1];
}

function changeFile(file, edd = currentEditor) {
  if (file.data) return;

  editors[edd].currentFile = file.path;
  selectedFile = file.path;

  selectedFolder = file.path.split("/")[1];
  document.getElementsByClassName("frameTitle")[0].innerText = selectedFolder;

  if (editors[edd].getValue() != file.code)
    editors[edd].setValue(file.tempCode);

  let suffix = getSuffix(file.name);
  editors[edd].setMode((suffix == "html")?"htmlmixed":(suffix == "js")?"javascript":"css");

  addOpen(file, edd);

  renderFiles();
}

function addOpen(file, edd, ignore = false) {
  if (!ignore && editors[edd].opened.includes(file.path)) return;
  if (!editors[edd].opened.includes(file.path))
    editors[edd].opened.push(file.path);

  let openElement = document.getElementsByClassName("open")[edd];

  let base = document.createElement("button");
  base.className = "openBase" + ((file.saved)?"":" unsaved") + ((editors[edd].currentFile == file.path)?" selected":"");

  let text = document.createElement("div");
  text.className = "openText";
  text.innerText = file.name;

  let remove = document.createElement("button");
  remove.className = "openRemove";
  remove.innerText = "X";

  base.appendChild(text);
  base.appendChild(remove);

  base.addEventListener("click", e=>{
    changeFile(file, edd);
  });

  remove.addEventListener("click", e=>{
    closeFile(file, edd);
    e.stopPropagation();
  });

  openElement.appendChild(base);
}


function closeFile(file, edd) {
  if (!editors[edd].opened.includes(file.path)) return;

  let prevent = false;
  if (!editors[!edd*1].opened.includes(file.path)) {
    file.tempCode = file.code;
    file.saved = true;
    prevent = true;
  }



  if (!prevent && !file.saved && !confirm("Are you sure? You seem to have unfinished business 🤨 (ctrl+s)")) return;

  editors[edd].opened.splice(editors[edd].opened.indexOf(file.path), 1);

  if (file.path == editors[edd].currentFile)
    findNewFile(edd);

  renderFiles();
}

function findNewFile(edd) {
  if (editors[edd].opened.length > 0) {
    changeFile(fromPath(editors[edd].opened[editors[edd].opened.length - 1]), edd);
  } else {
    editors[edd].currentFile = undefined;
    editors[edd].preventNext = true;
    editors[edd].setValue("");
  }
}





//
//File upload
//

function handleFileUpload(e) {
  uploadFile([...e.target.files]);
}

function uploadFile(files) {
  for (let i in files) {
    let file = files[i];

    let reader = new FileReader();

    reader.readAsDataURL(file,'UTF-8');
    reader.onload = readerEvent => {
      let data = readerEvent.target.result;
      let child;

      if (file.type.split("/")[0] == "text") {
        child = new Files(file.name, atob(data.split(",")[1]));
      } else {
        child = new Files(file.name, "");
        child.data = data;
      }

      child.unsave();

      selectedFolder.addChild(child);

      renderFiles();
    }
  }
}

let dropArea = document.getElementById("fileDrop");
if (dropArea) {
  dropArea.addEventListener("dragenter", dragenter);
  dropArea.addEventListener("dragleave", dragleave);
  dropArea.addEventListener("dragover", dragover);
  dropArea.addEventListener("drop", drop);
  dropArea.addEventListener("click", fileClick);
}

function dragover(e) {
  dropArea.classList.add("hovering");
  stopit(e)
}
function dragenter(e) {
  stopit(e)
}
function dragleave(e) {
  dropArea.classList.remove("hovering");
  stopit(e)
}

function drop(e) {
  let files = e.dataTransfer.files;
  uploadFile([...files]);
  stopit(e)
}

function stopit(e) {
  e.preventDefault();
  e.stopPropagation();
}

function fileClick() {
  let fileUpload = document.createElement("input");
  fileUpload.type = "file";
  fileUpload.setAttribute("multiple", 1);
  fileUpload.onchange = e=>{handleFileUpload(e)};
  fileUpload.click();
}
