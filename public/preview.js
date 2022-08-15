let iframe = document.getElementById("previewFrame");

async function togglePreview(elem) {
  elem.classList.toggle("selected");
  if (elem.classList.contains("selected")) {
    consoleClear();
    iframe.src = document.location.origin + `/fileServer/ROOT/${selectedFolder}/index.html`;
    // iframe.addEventListener("load", ()=>{
    //   iframe.contentWindow.console.log = (...args)=>{console.log(...[...args, " - penus"])};
    // });
  } else {
    iframe.src = "";
  }
}
