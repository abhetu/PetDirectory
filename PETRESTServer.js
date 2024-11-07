const hostname = "127.0.0.1";
const port = 8000;
const http = require("http");

var Pets = new Map();
Pets.set("Barky", { species: "Dog", breed: "Labrador", age: 3 });
Pets.set("Meowy", { species: "Cat", breed: "Siamese", age: 1 });

function NotExists(name, res) {
  if (Pets.has(name)) return false;
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 404;
  res.write(JSON.stringify({ error: `${name} not found` }));
  return true;
}

function readall(res) {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.write(JSON.stringify([...Pets.keys()]));
}

function readone(res, name) {
  if (NotExists(name, res)) return;
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.write(JSON.stringify(Pets.get(name)));
}

function createone(res, name, item) {
  if (Pets.has(name)) {
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 400;
    res.write(`${name} already exists`);
  } else {
    Pets.set(name, item);
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 200;
    res.write(`${name} created`);
  }
}

function deleteone(res, name) {
  if (NotExists(name, res)) return;
  Pets.delete(name);
  res.setHeader('Content-Type', 'text/plain');
  res.statusCode = 200;
  res.write(`${name} deleted`);
}

function updateone(res, name, item) {
  if (NotExists(name, res)) return;
  const original = Pets.get(name);
  for (let key in item) {
    original[key] = item[key];
  }
  res.setHeader('Content-Type', 'text/plain');
  res.statusCode = 200;
  res.write(`${name} updated`);
}

function handle_get(req, res) {
  if (req.url === "/") {
    readall(res);
    return;
  }
  readone(res, req.url.substring(1));
}

function handle_post(req, res, body) {
  createone(res, req.url.substring(1), JSON.parse(body));
}

function handle_put(req, res, body) {
  updateone(res, req.url.substring(1), JSON.parse(body));
}

function handle_patch(req, res, body) {
  updateone(res, req.url.substring(1), JSON.parse(body));
}

function handle_delete(req, res) {
  deleteone(res, req.url.substring(1));
}

function handle_req(req, res, body) {
  try {
    console.log(`handle_req ${req.method} request for ${req.url}`);
    res.setHeader
// Add CORS headers to allow cross-origin requests
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

if (req.method === "GET") handle_get(req, res);
else if (req.method === "POST") handle_post(req, res, body);
else if (req.method === "PUT") handle_put(req, res, body);
else if (req.method === "PATCH") handle_patch(req, res, body);
else if (req.method === "DELETE") handle_delete(req, res);
} catch (error) {
res.setHeader('Content-Type', 'application/json');
res.statusCode = 500;
res.write(JSON.stringify({ error: error.message }));
} finally {
res.end();
}
}

// Create the server
http.createServer((req, res) => {
let body = [];
req.on('error', (err) => { console.error(err); });
req.on('data', (chunk) => { body.push(chunk); });
req.on('end', () => { 
handle_req(req, res, Buffer.concat(body).toString()); 
}); 
}).listen(port, hostname, () => {
console.log(`Server running at http://${hostname}:${port}/`);
});