const express = require('express')
const session = require('express-session')
const exphbs = require('express-handlebars')
const path = require('path')
const fs = require('fs')
const https = require('https')
const methodOverride = require('method-override')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const flash = require('express-flash')

// Create Express Server
const app = express()

// Read environment variables
require('dotenv').config()

const mainRoute = require('./routes/main')
const userRoute = require('./routes/user')
const propertyRoute = require('./routes/property')
const rentalRoute = require('./routes/rental')

// Bring in Handlebars helpers
const { formatDate, autoSelectDropDown, roundOffToThousand, roundOffToMillion, checkSpecialUserType } = require('./helpers/hbs')

// Handlebar mMiddleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main', // Specify default template views/layout/main.handlebar
  helpers: {
    formatDate: formatDate,
    autoSelectDropDown: autoSelectDropDown,
    roundOffToThousand: roundOffToThousand,
    roundOffToMillion: roundOffToMillion,
    checkSpecialUserType: checkSpecialUserType
  }
}))
app.set('view engine', 'handlebars')

// Body parser middleware to parse HTTP body to read post data
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, 'public')))

// Method override middleware to use other HTTP methods such as PUT and DELETE
app.use(methodOverride('_method'))

// Library to use MySQL to store session objects
const MySQLStore = require('express-mysql-session')
const db = require('./config/db.js')

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser())

// Removed unused libraries later

// Messaging libraries
// const flash = require('connect-flash')
// const FlashMessenger = require('flash-messenger')

// Two flash messenging libraries - Flash (connect-flash) and Flash Messenger
app.use(flash())
// app.use(FlashMessenger.middleware)

// Bring in database connection
const realEstateDB = require('./config/DBConnection')

// Connects to MySQL database
// To set up database with new tables set (true)
const restartDB = false
realEstateDB.setUpDB(restartDB)

// Passport Config
const authenticate = require('./config/passport')
authenticate.localStrategy(passport)

// Express session middleware - uses MySQL to store session
app.use(session({
  key: 'iPG_session',
  secret: process.env.cookieSecret || 'toGiv',
  store: new MySQLStore({
    host: db.host,
    port: db.port,
    user: db.username,
    password: db.password,
    database: db.database,
    clearExpired: true,
    // How frequently expired sessions will be cleared; milliseconds:
    checkExpirationInterval: 900000,
    // The maximum age of a valid session; milliseconds:
    expiration: 900000
  }),
  resave: false,
  saveUninitialized: false
}))

// Initilize Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Global cookies
app.use((req, res, next) => {
  // Defaults to null if user is not logged in
  res.locals.user = req.user || null
  next()
})

// Routes
app.use('/', mainRoute)
app.use('/user', userRoute)
app.use('/property', propertyRoute)
app.use('/rental', rentalRoute)

// Catch all URL that is not valid and return 404 error
app.get('*', (req, res) => {
  res.render('errorCodes', {
    errorCode: '404',
    errorMessage: 'Are you on the right page?'
  })
})

// Error Codes
app.use((err, req, res, next) => {
  // Log Error
  console.log(err)
  if (res.status(400)) {
    res.render('errorCodes', {
      errorCode: '400',
      errorMessage: 'Its a bad request!'
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

// This function shall not be disabled at all cost since this function automatically adds a required users
// should we intend to reset the database whenever we want
const checkDefaultData = require('./config/defaultDataInfo')
checkDefaultData.check().catch((err) => {
  // log error
  console.log(err)
})

// Create HTTPS Server
https.createServer(
  options,
  app
).listen(port, () => {
  console.log(`HTTPS Web Server started at port ${port}`)
})
