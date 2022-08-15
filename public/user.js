let loginForm = document.getElementsByClassName("loginContainer")[0];
let loginDim = document.getElementsByClassName("loginDim")[0];
let username = document.getElementById("username");
let password1 = document.getElementById("password1");
let password2 = document.getElementById("password2");

let loginAlert = document.getElementsByClassName("notLoggedIn")[0];
let loginError = document.getElementsByClassName("loginError")[0];

loginToken();


function requestLogin() {
  loginForm.style.display = "flex";
  loginDim.style.display = "flex";
  loginAlert.style.display = "block";
}
function hideLogin() {
  loginForm.style.display = "none";
  loginDim.style.display = "none";
}

async function login() {
  let signup = (password1.autocomplete == "new-password");

  let res = await fetch(window.location.origin + ((!signup)?"/postlogin/":"/postsignup/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username.value,
      password1: password1.value,
      password2: password2.value
    })
  }).then(a=>a.json());

  if (res.status == "ok") {
    document.location.href = res.redirect;
    return;
  } else {
    loginError.innerText = res.status;
    setTimeout(()=>{
      loginError.innerText = "";
    }, 1000);
  }
}
function switchLogin() {
  let logswitch = document.getElementById("loginSwitch");
  let btn = document.getElementById("loginButton");

  if (password1.autocomplete != "new-password") {
    username.autocomplete = "new-username";
    password1.autocomplete = "new-password";
    password2.disabled = false;
    logswitch.innerText = "Log in instead";
    btn.innerText = "Sign up";
  } else {
    username.autocomplete = "username";
    password1.autocomplete = "password";
    password2.disabled = true;
    logswitch.innerText = "Sign up instead";
    btn.innerText = "Log in";
  }
}


async function logout() {
  await fetch(window.location.origin + "/logout/");
  requestLogin();
}

async function loginToken() {

  let res = await fetch(window.location.origin + "/postlogintoken/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  }).then(a=>a.json());

  if (res.status != "ok") {
    requestLogin();
  }
}
