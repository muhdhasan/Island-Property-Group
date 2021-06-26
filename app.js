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

// Error Codes
app.use((req, res) => {
  if (res.status(400)) {
    res.render('errorCodes', {
      errorCode: '400',
      errorMessage: 'Its a bad request!'
    })
  } else if (res.status(404)) {
    res.render('errorCodes', {
      errorCode: '404',
      errorMessage: 'Are you on the right page?'
    })
  } else if (res.status(500)) {
    res.render('errorCodes', {
      errorCode: '500',
      errorMessage: 'Its a internal server error!'
    })
  } else if (res.status(502)) {
    res.render('errorCodes', {
      errorCode: '502',
      errorMessage: 'Its a bad gateway!'
    })
  } else if (res.status(503)) {
    res.render('errorCodes', {
      errorCode: '503',
      errorMessage: 'Service is currently unavailable.'
    })
  }
})

// Port number defaults to 5000 if env file is not available
const port = process.env.port || 5000

const options = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
}

// Create HTTP Server
https.createServer(
  options,
  app
).listen(port, () => {
  console.log(`Server started ad ${port}`)
})
