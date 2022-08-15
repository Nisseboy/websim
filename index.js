const express = require('express');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const multer = require('multer');
const compression = require('compression');
const upload = multer();

const mime = require('mime-types');

const app = express();
const port = 8080;
const path = require('path');

require('dotenv').config();

const fs = require('fs');
const pg = require('pg');

const crypto = require('crypto');

const DBTOKEN = process.env.DBTOKEN;

const client = new pg.Client(DBTOKEN);
client.connect();
client.query('CREATE TABLE IF NOT EXISTS users (username STRING PRIMARY KEY, password STRING, salt STRING, tokens STRING, files STRING);');


app.use(cookieParser());
app.use(express.json());
app.use(upload.array());
app.use(compression());

//Add trailing slash
app.use((req, res, next) => {
	if (req.path.substr(-1) != '/' && req.path.length > 1 && req.path.split('/')[1] != 'fileServer') {
		const query = req.url.slice(req.path.length);
		res.redirect(301, req.path + '/' + query);
	} else {
		next();
	}
})


app.post('/postlogin', (req, res) => {
	login(req, res);
});
app.get('/logout', (req, res) => {
	setCookie(res, token, '');
	setCookie(res, username, '');

	res.send({status: 'ok'});
});
app.post('/postlogintoken', (req, res) => {
	logintoken(req, res);
});
app.post('/postsignup', (req, res) => {
	signup(req, res);
});

app.post('/postfiles', (req, res) => {
	postfiles(req, res);
});
app.get('/getfiles', (req, res) => {
	getfiles(req, res);
});

app.get('/', (req, res) => {
	let username = req.cookies.username;

	if (!username) {
		res.redirect('/user/nulluser/');
	} else {
		res.redirect(`/user/${username}/`);
	}
});
app.get('/user/*', async (req, res) => {
  let fpath = req.path.split('/');

  fpath.shift();
  fpath.shift();
  fpath.shift();

  fpath = fpath.join('/');

  if (!fpath) fpath = 'index.html';
  res.sendFile(path.join(__dirname, 'public', fpath));
});

app.get('/fileServer/*', async (req, res) => {
	let owner = req.cookies.owner;
	let fpath = req.path.split('/');
	fpath.shift();
	fpath.shift();
	fpath = fpath.join('/');

	let response = await client.query('SELECT files FROM users WHERE username = $1', [owner]);
	if (response.rows.length == 0) {res.send('User does not exist'); return}
	if (!response.rows[0]) {res.send('No files'); return}

	let files = JSON.parse(response.rows[0].files);

	let file = fromPath(files, fpath);
	if (file.data)
		file.code = file.data;
	if (file.code !== 1) {
		res.setHeader('content-type', mime.lookup(file.name));
		res.send(file.code);
	}
});

function fromPath(files, path) {
	let found;
	iterate(files, (file)=>{
		if (file.path == path)
			found = file;
	});
	return found;
}
function iterate(file, func) {
	func(file);
	for (let i in file.children) {
		iterate(file.children[i], func);
	}
}


async function login(req, res) {
  let username = req.body.username;
  let password = req.body.password1;

  if (!(username && password)) {res.send({status: 'Please fill in all fields'}); return}

  let response = await client.query('SELECT * FROM users WHERE username=$1;', [username]);
  if (response.rows.length == 0) {res.send({status: 'No such user'}); return}
  let user = response.rows[0];

  let salt = user.salt;
  let hash = getHash(password + salt);

  if (hash != user.password) {res.send({status: 'Incorrect password'}); return}

  let token = getToken();
  let hashedToken = getHash(token + salt);
  setCookie(res, 'token', token);
  setCookie(res, 'username', username);

  await client.query('UPDATE users SET tokens = $1 WHERE username = $2', [user.tokens + ',' + hashedToken, username]);

  res.send({status: 'ok', redirect: `/user/${username}/`});
}
async function signup(req, res) {
  let username = req.body.username;
  let password = req.body.password1;
  let password2 = req.body.password2;

  if (!(username && password && password2)) {res.send({status: 'Please fill in all fields'}); return};
  if (password != password2) {res.send({status: 'Passwords do not match'}); return};

  let response = await client.query('SELECT * FROM users WHERE username=$1;', [username]);
  if (response.rows.length > 0) {res.send({status: 'User already exists'}); return};

  let salt = getSalt();
  let hash = getHash(password + salt);
  let token = getToken();
  let hashedToken = getHash(token + salt);

  await client.query('INSERT INTO users(username, password, salt, tokens, files) VALUES ($1, $2, $3, $4, \'\');', [username, hash, salt, hashedToken]);

  setCookie(res, 'token', token);
  setCookie(res, 'username', username);

  res.send({status: 'ok', redirect: `/user/${username}/`});
}

async function logintoken(req, res) {
	let username = req.cookies.username;
	let token = req.cookies.token;

	if (!username || !token) {res.send({status: 'err'}); return};

	let response = await validateToken(username, token);

	if (response) {res.send({status: 'ok'}); return}
	else {res.send({status: 'err'}); return}
}


async function postfiles(req, res) {
	let root = req.body.root;
	let owner = req.cookies.owner;
	let username = req.cookies.username;
	let token = req.cookies.token;

	if (owner != username) {res.send({status: 'Not authorized'}); return}
	let loggedin = await validateToken(username, token);
	if (!loggedin) {res.send({status: 'Not logged in'}); return}

	await client.query('UPDATE users SET files = $1 WHERE username = $2', [JSON.stringify(root), username]);

	res.send({status: 'ok'});
}

async function getfiles(req, res) {
	let owner = req.cookies.owner;

	let response = await client.query('SELECT files FROM users WHERE username = $1', [owner]);
	if (response.rows.length == 0) {res.send({status: 'No such user'}); return}
	if (!response.rows[0].files) {res.send({status: 'No files'}); return}

	res.send({status: 'ok', files: JSON.parse(response.rows[0].files)});
}



async function validateToken(username, token) {
  let user = await client.query('SELECT * FROM users WHERE username = $1', [username]);
  if (user.rows.length == 0) return;

  let hashedToken = getHash(token + user.rows[0].salt);

  user = await client.query('SELECT * FROM users WHERE tokens LIKE $1', ['%' + hashedToken + '%']);

  return (user.rows.length != 0);
}




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
