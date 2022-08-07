let iframe = document.getElementById("previewFrame");

async function togglePreview(elem) {
  elem.classList.toggle("selected");
  if (elem.classList.contains("selected")) {
    consoleClear();
    iframe.src = "preview";
  } else {
    iframe.src = "";
  }
}
