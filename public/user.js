let uuid = getCookie("uuid");
if (!uuid) {
  uuid = createUUID();
  setCookie("uuid", uuid);
}


function createUUID() {
  let uuid = "";
  let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (let i = 0; i < 10; i++) {
    uuid += chars[Math.floor(Math.random() * chars.length)];
  }
  return uuid;
}


//From W3Schools
function setCookie(cname, cvalue) {
  const d = new Date();
  d.setTime(d.getTime() + 864000000); //10 days
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
