const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const fs = require('fs')
const https = require('https')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

// Create Express Server
const app = express()

require('dotenv').config()

const mainRoute = require('./routes/main')
const userRoute = require('./routes/user')
const propertyRoute = require('./routes/property')

// Bring in Handlebars helpers
const { formatDate } = require('./helpers/hbs')

// Handlebar mMiddleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main', // Specify default template views/layout/main.handlebar
  helpers: {
    formatDate: formatDate
  }
}))
app.set('view engine', 'handlebars')

// Body parser middleware to parse HTTP body to read post data
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, 'public')))

// Method override middleware to use other HTTP methods such as PUT and DELETE
app.use(methodOverride('_method'))

// Routes
app.use('/', mainRoute)
app.use('/user', userRoute)
app.use('/property', propertyRoute)

// Library to use MySQL to store session objects
// const MySQLStore = require('express-mysql-session')
// const db = require('./config/db.js')

// Messaging libraries
// const flash = require('connect-flash')
// const FlashMessenger = require('flash-messenger')

// Two flash messenging libraries - Flash (connect-flash) and Flash Messenger
// app.use(flash())
// app.use(FlashMessenger.middleware)

// Bring in database connection
const realEstateDB = require('./config/DBConnection')

// Connects to MySQL database
// To set up database with new tables set (true)
const restartDB = false
realEstateDB.setUpDB(restartDB)

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

// Retrieve Certs for HTTPS server
const options = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
}

// This function shall not be disabled at all cost since this function automatically adds a admin user
// should we intend to reset the database whenever we want
const checkDefaultData = require('./config/defaultDataInfo')
checkDefaultData.check().catch((err) => {
  // log error
  console.log(err)
})

// Create HTTP Server
https.createServer(
  options,
  app
).listen(port, () => {
  console.log(`HTTPS Web Server started at ${port}`)
})
