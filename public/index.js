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


let root;

load();





function popup(text, time) {
  let popupElem = document.getElementsByClassName("popupHolder")[0];

  popupElem.innerText = text;
  popupElem.style.transform = "scaleY(1)";
  setTimeout(()=>{
    popupElem.style.transform = "scaleY(0)";
  }, time);
}
