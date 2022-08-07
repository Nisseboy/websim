let uuid = getCookie("uuid");
if (!uuid) {
  uuid = createUUID();
  setCookie("uuid", uuid);
}


//CodeMirror stuff
let editors = [
  new CodeEditor(0),
  new CodeEditor(1)
];
currentEditor = 0;






document.addEventListener("keydown", e=>{
  if (e.ctrlKey && e.code == "KeyS") {
    root.iterate(file=>{
      file.code = file.tempCode;
      file.saved = true;

      if (file.openElement)
        file.openElement.classList.remove("unsaved");
      file.hierarchyElement.classList.remove("unsaved");
    }, true);
    save();
    e.preventDefault();
  }
});


let root = new Files("ROOT").addChildren([
  new Files("testProj").addChildren([
    new Files("index.html", ""),
    new Files("index.js", ""),
    new Files("style.css", ""),
  ])
]);

rectify();

changeFile(root.children[0].children[1]);

load();






function createUUID(){
  let dt = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (dt + Math.random()*16)%16 | 0;
    dt = Math.floor(dt/16);
    return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}


//From W3Schools
function setCookie(cname, cvalue) {
  const d = new Date();
  d.setTime(d.getTime() + 864000000); //10 days
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
