let menu;
let menuX;
let menuY;

function createMenu(x, y, arr) {
  closeMenu();
  menu = document.createElement("div");
  menu.className = "contextMenu";
  menu.style.left = x + 1 + "px";
  menu.style.top = y + "px";

  menuX = x;
  menuY = y;

  for (let i in arr) {
    let b = arr[i];
    let elem;
    if (!b.custom) {
      elem = document.createElement("button");
      elem.classList = "contextButton";
      elem.innerText = b.text;
      elem.addEventListener("click", b.callback);
    } else {
      elem = b.custom;
    }

    menu.appendChild(elem);
  }

  document.body.appendChild(menu);
}

function closeMenu() {
  if (menu) menu.remove();
}

document.addEventListener("click", e=>{
  closeMenu();
});
