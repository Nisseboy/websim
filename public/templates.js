let templates = [];

function fromTemplate(template, name) {
  let file = templates.find(elem=>{return elem.name == template}).file.copy(name);
  return file;
}


templates = [
  {name: "p5js", file: new Files("p5js").addChildren([
    new Files("index.html", "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <script src=\"https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.1/p5.js\"></script>\n    <script src=\"https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.1/addons/p5.sound.min.js\"></script>\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\">\n    <meta charset=\"utf-8\" />\n\n  </head>\n  <body>\n    <main>\n    </main>\n    <script src=\"sketch.js\"></script>\n  </body>\n</html>\n"),
    new Files("sketch.js", "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(220);\n}"),
    new Files("style.css", "html, body {\n  margin: 0;\n  padding: 0;\n}\ncanvas {\n  display: block;\n}\n"),
  ])},
];
