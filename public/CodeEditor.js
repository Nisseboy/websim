class CodeEditor {
  constructor(index) {
    this.currentFile;
    this.opened = [];
    this.index = index;

    this.preventNext = false;

    this.editor = CodeMirror.fromTextArea(document.getElementById("codemirror" + (index + 1)), {
      lineNumbers: true,
      matchBrackets: true,
      theme: "one-dark",
      mode: {name: "text/html", globalVars: true},
      keyMap: "sublime",
      tabSize: 2,
      autoCloseBrackets: true,
      autoCloseTags: true,
      highlightSelectionMatches: true,
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      hintOptions: {
        completeSingle: false,
        extraKeys: {
          "Tab": function(cm, a) {
            a.pick();
          },
          "Esc": function(cm, a) {
            a.close();
          },
          "Up": function(cm, a) {
            a.moveFocus(-1);
          },
          "Down": function(cm, a) {
            a.moveFocus(1);
          }
        },
      },
      extraKeys: {
        "Tab": "emmetExpandAbbreviation",
      },
      emmet: {
        mark: true,
        markTagPairs: true,
        previewOpenTag: true,
        preview: true,
      }
    });
    this.editor.on("inputRead", function(editor, input) {
      if (input.text[0] === ";" || input.text[0] === " ") {
        return;
      }
      if (editor.options.mode == "text/html") {
        return
      }
      if (editor.options.mode == "css")
        editors[0].editor.execCommand("emmetResetAbbreviation");
      editor.showHint({
        hint: CodeMirror.hint.auto,
      });
    });
    this.editor.on("change", (a, b) => {
      if (this.preventNext || !this.currentFile) return;
      let file = fromPath(this.currentFile);
      file.tempCode = this.editor.getValue();

      file.saved = (file.code == file.tempCode);

      let other = editors[!this.index*1];
      if (other.currentFile == this.currentFile) {
        other.preventNext = true;
        other.setValue(this.editor.getValue());
      }

      renderFiles();
    });
    this.editor.on("mousedown", () => {
      currentEditor = this.index;
    });
  }
  getValue() {
    return this.editor.getValue();
  }
  setValue(value) {
    this.editor.setValue(value);
  }
  setMode(mode) {
    this.editor.setOption("mode", mode);
  }
}
