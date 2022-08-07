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
    new Files("folder").addChildren([
      new Files("index.js", "alert(1)"),
    ]),
    new Files("index.html", "<script src=\"index.js\"></script>"),
    new Files("index.js", "alert(1)"),
  ])
]);

rectify();

changeFile(root.children[0].children[1]);

load();



window.addEventListener("beforeunload", (e) => {
  if (!saved) {
    let answer = confirm("You have unsaved progress, save? (save: ok, don't save: cancel)");
    if (answer)
      save();
  }
});