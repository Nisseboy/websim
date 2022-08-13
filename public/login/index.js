let pswElems = document.getElementsByClassName("password");
for (let i = 0; i < pswElems.length; i++) {
  let psw = pswElems[i];

  let btn = document.createElement("button");

  psw.appendChild(btn);
}


if (document.location.search) {
  let err = document.location.search.split("err=")[1].replaceAll("%20", " ");
  let errElem = document.getElementsByClassName("error")[0];

  errElem.innerText = err;
}
