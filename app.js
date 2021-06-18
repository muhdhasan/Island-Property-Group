const express = require('express')

const app = express()
require('dotenv').config()

app.use(express.static('public'))

app.get('/', (req, res) => {
  // res.render('index');
  res.send('<h1>Hello World</h1>')
})

const port = process.env.port || 5000

app.listen(port, () => {
  console.log(`Server started ad ${port}`)
})

// const http = require('http');

// const hostname = '127.0.0.1';
// // const port = 3000;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello World');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });
