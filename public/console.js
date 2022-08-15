let consoleInject = "<script type=\"text/javascript\">  function sendup(text, method) {    window.parent.parent.postMessage({      text: text,      method: method    }, \"*\");  }    let oldL = console.log;  console.log = (...args) => {oldL(...args); sendup(args.join(\" \"), \"log\")};  let oldW = console.warn;  console.warn = (...args) => {oldW(...args); sendup(args.join(\" \"), \"warn\")};  let oldE = console.error;  console.error = (...args) => {oldE(...args); sendup(args.join(\" \"), \"error\")};</script>";
let consoleElem = document.getElementsByClassName("console")[0];

let consoleHistory = {
  commands: [],
  cursor: -1
};

//CodeMirror stuff
let consoleEditor = CodeMirror.fromTextArea(document.getElementById("consoleInput"), {
  lineNumbers: true,
  matchBrackets: true,
  theme: "one-dark",
  mode: {name: "javascript", globalVars: true},
  keyMap: "sublime",
  tabSize: 2,
  autoCloseBrackets: true,
  autoCloseTags: true,
  hintOptions: {
    completeSingle: false,
    customKeys: {
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
});
consoleEditor.on("inputRead", function(editor, input) {
  if (input.text[0] === ';' || input.text[0] === ' ' || input.text[0] === '') {
    return;
  }
  editor.showHint({
    hint: CodeMirror.hint.auto,
  });
});
consoleEditor.display.wrapper.classList.add("cm-console");

consoleEditor.on("keydown", (cm, e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    e.stopPropagation();

    let text = consoleEditor.getValue();

    if (text.trim(" ") === "") {
      return false;
    }

    consoleEditor.setValue("");
    executeConsole(text);

    consoleHistory = {
      commands: [text, ...consoleHistory.commands],
      cursor: -1
    };
  } else if (e.key == "ArrowUp") {
    let lineNumber = cm.getDoc().getCursor().line;

    if (lineNumber != 0) {
      return false;
    }

    consoleHistory.cursor = Math.min(
      consoleHistory.cursor + 1,
      consoleHistory.commands.length - 1
    );

    cm.setValue(consoleHistory.commands[consoleHistory.cursor]);
    let cursorPos = cm.getDoc().getLine(0).length - 1;
    cm.getDoc().setCursor({ line: 0, ch: cursorPos });
  } else if (e.key == 'ArrowDown') {
    let lineNumber = cm.getDoc().getCursor().line;
    let lineCount = cm.getValue().split('\n').length;

    if (lineNumber + 1 != lineCount) {
      return false;
    }

    let newCursor = Math.max(consoleHistory.cursor - 1, -1);
    cm.getDoc().setValue(consoleHistory.commands[newCursor]);

    let newLineCount = cm.getValue().split('\n').length;
    let newLine = cm.getDoc().getLine(newLineCount);

    let cursorPos = newLine ? newLine.length - 1 : 1;
    cm.getDoc().setCursor({ line: lineCount, ch: cursorPos });
  }
});


function executeConsole(text) {
  consoleWrite(text, "command");
  try {
    consoleWrite(iframe.contentWindow.eval(text), "result");
  } catch (e) {
    consoleWrite(e, "error");
  }
}



function consoleWrite(text, method) { //command, result, log, warn, error
  let command = document.createElement("div");
  command.className = "consoleCommand " + method;

  let icon = document.createElement("img");
  icon.className = "commandIcon";
  icon.src = "icons/console/" + method + ".png";
  command.appendChild(icon);

  let textElem = document.createElement("div");
  textElem.className = "commandText" + ((method != "command")?" " + method:"");
  textElem.innerText = text;
  if (text == undefined)
    textElem.style.color = "rgb(222, 74, 155)";
  command.appendChild(textElem);

  consoleElem.appendChild(command);

  consoleElem.scrollTop = consoleElem.scrollHeight;
}

function consoleClear() {
  consoleElem.replaceChildren();
}

window.addEventListener("message", (e)=>{
  consoleWrite(e.data.text, e.data.method);
});
