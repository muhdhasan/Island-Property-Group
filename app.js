const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const fs = require('fs')
const https = require('https')

const app = express()
require('dotenv').config()

app.engine('handlebars', exphbs({
  defaultLayout: 'main' // Specify default template views/layout/main.handlebar
}))
app.set('view engine', 'handlebars')

app.use(express.static(path.join(__dirname, 'public')))

const mainRoute = require('./routes/main')
const userRoute = require('./routes/user')
const propertyRoute = require('./routes/property')

// Routes
app.use('/', mainRoute)
app.use('/user', userRoute)
app.use('/property', propertyRoute)

// Port number defaults to 5000 if env file is not available
const port = process.env.port || 5000

// Create HTTP Server
https.createServer({
     key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
     cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
   },
   app
).listen(port, () => {
  console.log(`Server started ad ${port}`)
})
