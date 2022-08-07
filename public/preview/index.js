let consoleInject = "<script type=\"text/javascript\">  function sendup(text, method) {    window.parent.parent.postMessage({      text: text,      method: method    }, \"*\");  }    let oldL = console.log;  console.log = (...args) => {oldL(...args); sendup(args.join(\" \"), \"log\")};  let oldW = console.warn;  console.warn = (...args) => {oldW(...args); sendup(args.join(\" \"), \"warn\")};  let oldE = console.error;  console.error = (...args) => {oldE(...args); sendup(args.join(\" \"), \"error\")};</script>";


let token = Math.floor(Math.random() * 100000000000);
setCookie("token", token);


let iframe = document.getElementsByClassName("previewFrame")[0];

let root;
let currentFolder;

function load() {
  let state = JSON.parse(localStorage.getItem("state"));
  if (state == null) return;
  state.root = restoreFile(state.root);
  root = state.root;
  currentFolder = state.selectedFile.split("/")[1];

  rectify();
}



async function startPreview() {
  document.body.children[0].remove();
  load();

  let folder = fromPath("ROOT/" + currentFolder);





  let fileList = {
    png: {mime: "image/png", files: [], fileList: []},
    svg: {mime: "image/svg+xml", files: [], fileList: []},
    jpg: {mime: "image/jpeg", files: [], fileList: []},
    json: {mime: "application/json", files: [], fileList: []},
    css: {mime: "text/css", files: [], fileList: []},
    js: {mime: "text/javascript", files: [], fileList: []},
    html: {mime: "text/html", files: [], fileList: []}
  };

  folder.iterate(file=>{
    let suffix = getSuffix(file.name);
    fileList[suffix].files.push(file);
  }, true);

  let indexIndex = fileList.html.files.indexOf(
    fileList.html.files.find(elem=>{
      return (elem.name == "index.html")
    })
  );

  fileList.html.files[indexIndex].code = consoleInject + fileList.html.files[indexIndex].code;

  replaceFileNames(fileList.css, fileList.png);
  replaceFileNames(fileList.css, fileList.svg);
  replaceFileNames(fileList.css, fileList.jpg);
  replaceFileNames(fileList.js, fileList.png);
  replaceFileNames(fileList.js, fileList.svg);
  replaceFileNames(fileList.js, fileList.jpg);
  replaceFileNames(fileList.html, fileList.png);
  replaceFileNames(fileList.html, fileList.svg);
  replaceFileNames(fileList.html, fileList.jpg);
  replaceFileNames(fileList.html, fileList.css);
  replaceFileNames(fileList.html, fileList.js);

  let sendFiles = [];
  folder.iterate(file=>{
    file.path = file.path.split("/");
    file.path.shift();
    file.path.shift();
    file.path = file.path.join("/");

    sendFiles.push({path: file.path, name: file.name, data: file.data || file.code});
  }, true);


  await fetch(window.location.origin + "/uploadFiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      files: sendFiles,
      token: token
    })
  });

  iframe.src = window.location.origin + "/previewServer/index.html";
}

function replaceFileNames(origin, replacer) {
  let output;
  for (let i = 0; i < origin.files.length; i++) {
    for (let j = 0; j < replacer.files.length; j++) {
      origin.files[i].code = origin.files[i].code.replaceAll(replacer.files[j].path, document.location.origin + "/previewServer/" + replacer.files[j].path);
    }
  }
}



function setCookie(cname, cvalue) {
  const d = new Date();
  d.setTime(d.getTime() + 864000000); //10 days
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
