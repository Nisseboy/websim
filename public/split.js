let splitters = document.getElementsByClassName("split");
for (let i = 0; i < splitters.length; i++) {
  createSplitter(splitters[i]);
}


function createSplitter(splitter) {
  let before = splitter.previousElementSibling;
  let parent = splitter.parentElement;
  let vert = splitter.classList.contains("vertical");

  let rect = parent.getBoundingClientRect();
  let fullStart = (vert)?rect.x:rect.y;
  let fullLength = (vert)?rect.width:rect.height;

  let down = function(e) {
    rect = parent.getBoundingClientRect();
    fullStart = (vert)?rect.x:rect.y;

    fullLength = (vert)?rect.width:rect.height;
    document.addEventListener("mousemove", hold);
    document.addEventListener("mouseup", up);
  }
  let hold = function(e) {
    let pos = ((vert)?e.clientX:e.clientY) - fullStart;
    let length = Math.max(pos / fullLength * 100, 0);

    if (vert) {
      before.style.width = length + "%";
    } else {
      before.style.height = length + "%";
    }
  }
  let up = function() {
    document.removeEventListener("mousemove", hold);
    document.removeEventListener("mouseup", up);
  }

  splitter.addEventListener("mousedown", down);
}
