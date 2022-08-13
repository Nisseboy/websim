const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const multer = require('multer');
const upload = multer();

const app = express();
const port = 8080;
const path = require('path');

require('dotenv').config();

const fs = require('fs');
const pg = require('pg');
const sqlEsc = require('sqlutils/pg').escape;

const crypto = require('crypto');

const DBTOKEN = process.env.DBTOKEN;

const client = new pg.Client(DBTOKEN);
client.connect();
client.query('CREATE TABLE IF NOT EXISTS users (username STRING PRIMARY KEY, password STRING, salt STRING, tokens STRING, files STRING);');


app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());

app.get('/*/edit', async (req, res) => {
  let token = req.cookies.token;
  let username = req.cookies.username;

  let validated = await validateToken(username, token);
  if (!validated) {res.redirect('login?err=Please log in'); return};

  res.sendFile(path.join(__dirname, 'public/index.html'));
});
app.get('/', (req, res) => {
  res.redirect('edit');
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login/login.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login/signup.html'));
});


app.post('/postlogin', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (!(username && password)) {res.redirect('login?err=Please fill in all fields'); return}

  let response = await client.query(`SELECT * FROM users WHERE username='${sqlEsc(username)}';`);
  if (response.rows.length == 0) {res.redirect('login?err=No such user'); return}
  let user = response.rows[0];

  let salt = user.salt;
  let hash = getHash(password + salt);

  if (hash != user.password) {res.redirect('login?err=Incorrect password'); return}

  let token = getToken();
  let hashedToken = getHash(token + salt);
  setCookie(res, 'token', token);
  setCookie(res, 'username', username);

  await client.query(`UPDATE users SET tokens = '${sqlEsc(user.tokens) + ',' + hashedToken}' WHERE username = '${sqlEsc(username)}'`);

  await client.query(``);

  res.redirect('/');
});
app.post('/postsignup', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let password2 = req.body.password2;

  if (!(username && password && password2)) {res.redirect('signup?err=Please fill in all fields'); return};
  if (password != password2) {res.redirect('signup?err=Passwords do not match'); return};

  let response = await client.query(`SELECT * FROM users WHERE username='${sqlEsc(username)}';`);
  if (response.rows.length > 0) {res.redirect('signup?err=Username already exists'); return};

  let salt = getSalt();
  let hash = getHash(password + salt);
  let token = getToken();
  let hashedToken = getHash(token + salt);

  await client.query(`INSERT INTO users(username, password, salt, tokens, files) VALUES ('${sqlEsc(username)}', '${hash}', '${salt}', '${hashedToken}', '');`);

  setCookie(res, 'token', token);
  setCookie(res, 'username', username);

  res.redirect('/');
});

async function validateToken(username, token) {
  let user = await client.query(`SELECT * FROM users WHERE username = '${sqlEsc(username)}'`);
  if (user.rows.length == 0) return;

  let hashedToken = getHash(token + user.rows[0].salt);

  user = await client.query(`SELECT * FROM users WHERE tokens LIKE '%${hashedToken}%'`);

  return (user.rows.length != 0);
}



app.use(express.static(path.join(__dirname, 'public')));
app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});



function getToken() {
  return crypto.randomBytes(32).toString('base64');
}
function getSalt() {
  return crypto.randomBytes(32).toString('base64');
}
function getHash(input) {
  return crypto.createHash('sha256').update(input).digest('base64');
}


function setCookie(res, name, value) {
  res.cookie(name, value, { maxAge: 2592000000, httpOnly: true }) //plus 1 month
}
