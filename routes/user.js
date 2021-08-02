const express = require('express')
const router = express.Router()

// Necessary Node Modules
const passport = require('passport')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const jwt = require('jsonwebtoken')
const fetch = require('node-fetch')

// Models
const User = require('../models/User')
const Chat = require('../models/Chat')
const hdbResale = require('../models/hdbResale')
const PrivateResale = require('../models/PrivateResale')
const PrivateRental = require('../models/PrivateRental')
const { response } = require('express')
const baseAPIUrl = 'http://localhost:8000/api/'

const secret = process.env.secret
const { ensureUserAuthenticated, checkNotAuthenticated } = require('../helpers/auth')

const transporter = nodemailer.createTransport({
  host: 'smtp.googlemail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'superlegitemail100percent@gmail.com', // generated ethereal user
    pass: 'Passw0rdyes' // generated ethereal password
  }
})

function createreturnmsg (intent, listingid,botmsgid,botorder,userid) {
  console.log('test check ')
  PrivateResale.findOne({ where: { id: listingid } }).then((listing) => {
    if (listing) {
      console.log('test 1')
      createPrivateResaleMsg(intent,listingid,botmsgid,botmsgid,userid)
      return 
    }
  })
  PrivateRental.findOne({ where: { id: listingid } }).then((listing) => {
    if (listing) {
      console.log('test 2')
      createPrivateRentalMsg(intent,listingid,botmsgid,botmsgid,userid)
      return 
    }
  })
  hdbResale.findOne({ where: { id: listingid } }).then((listing) => {
    if (listing) {
      console.log('test 3')
      createhdbResaleMsg(intent,listingid,botmsgid,botmsgid,userid)
      return 
    }
  })
}
function createPrivateResaleMsg (intent, listingid,botmsgid,botorder,userid) {
  console.log('resale test')
  var msg = "blank"
  PrivateResale.findOne({ where: { id: listingid } }).then((listing) => {
    switch (intent) {
      case 'goodbye':
        msg=  'thank you and good bye'
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'greeting':
        msg = 'hello there'
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'lease_commencement':
        msg =  'the lease commencement date is ' + listing.leaseCommenceDate.toString()
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'house_info':
        msg = 'Description: <br>' +
            listing.description.toString() + '<br>' +
            'House Type: ' + listing.houseType.toString() + '<br>' +
            'Postal District: ' + listing.postalDistrict.toString() + '<br>' +
            'Floor Square Meters: ' + listing.floorSqm.toString()
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'resale_price':
        msg = 'The resale price is ' + listing.resalePrice.toString()
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'resale_date':
        msg=  'The resale date is ' + listing.resaleDate.toString()
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'address':
        msg =  'The address is ' + listing.address.toString()
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'rent_cost':
        msg = 'This is not a rental listing '
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'viewing':
        if (listing.viewing) {
          msg = 'Listing is available for viewing'
          Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
          break;
        } else {
          msg =  'Listing is not available for viewing'
          Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
          break;
        }
    }
  })
}
function createPrivateRentalMsg (intent, listingid,botmsgid,botorder,userid) {
  console.log('rent test')
  PrivateRental.findOne({ where: { id: listingid } }).then((listing) => {
    var msg = 'blank'
    switch (intent) {
      case 'goodbye':
        msg = 'thank you and good bye'
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'greeting':
        msg = 'hello there'
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'lease_commencement':
        msg = 'the lease commencement date is ' + listing.leaseCommenceDate.toString()
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'house_info':
        msg = 'Description: <br>' +
            listing.description.toString() + '<br>' +
            'House Type: ' + listing.houseType.toString() + '<br>' +
            'Number of Bedrooms: ' + listing.numberOfBedroom.toString() + '<br>' +
            'Postal District: ' + listing.postalDistrict.toString() + '<br>' +
            'Floor Square Meters: ' + listing.floorSqm.toString()
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'resale_price':
        msg =  'This is not a sale listing'
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'resale_date':
        msg= 'This is not a sale listing'
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'address':
        msg = 'The address is ' + listing.address.toString()
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'rent_cost':
        msg = 'The monthly cost is ' + listing.monthlyRent.toString()
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'viewing':
        if (listing.viewing) {
          msg = 'Listing is available for viewing'
          Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
          break;
        } else {
          msg =  'Listing is not available for viewing'
          Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
          break;
        }
    }
  })
}
function createhdbResaleMsg (intent,listing,botmsgid,botorder,userid) {
  console.log('hdb test')
  var listingid = listing.id
    var msg = 'blank'
    console.log('-----------------------------------------------------------------')
    switch (intent) {
      case 'goodbye':
        msg = 'thank you and good bye'
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'greeting':
        msg ="helllo there"
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'lease_commencement':
        msg = 'the lease commencement date is ' + listing.leaseCommenceDate.toString()
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'house_info':
        msg = 'Description: <br>' +
            listing.description.toString() + '<br>' +
            'Town: ' + listing.town.toString() + '<br>' +
            'Flat Type: ' + listing.flatType.toString() + '<br>' +
            'Flat Model: ' + listing.flatModel.toString() + '<br>' +
            'Flat Level: ' + listing.flatLevel.toString() + '<br>' +
            'Postal District: ' + listing.postalDistrict.toString() + '<br>' +
            'Floor Square Meters: ' + listing.floorSqm.toString()
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'resale_price':
        msg = 'The resale price is ' + listing.resalePrice.toString()
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'resale_date':
        msg =  'The resale date is ' + listing.resaleDate.toString()
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'address':
        msg =  'The address is ' + listing.address.toString()
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'rent_cost':
        msg =  'This is not a rental listing '
        Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
        break;
      case 'viewing':
        if (listing.viewing) {
          msg = 'Listing is available for viewing'
          Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
          break;
        } else {
          msg =  'Listing is not available for viewing'
          Chat.create({ messageid: botmsgid, message: msg, chatorder: botorder, userid: userid, listingid: listingid, isBot: true })
          break;
        }
        default:
          return "TESTING"
    }
}
async function getIntent (usermsg) {
  const body = {
    userInput: usermsg
  }
  return new Promise((result, err) => {
    fetch(baseAPIUrl + 'chatbot', {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json()
      )
      .then((json) => {
        result(json)
      })
      .catch((err) => {
        console.log('Error:', err)
      })
  })
}

router.get('/register', checkNotAuthenticated, (req, res) => {
  const title = 'Register'
  res.render('user/register', { title })
})

router.get('/login', checkNotAuthenticated, (req, res) => {
  const title = 'Login'
  const activeNavLogin = 'active'
  res.render('user/login', { title, activeNavLogin })
})

router.post('/register', checkNotAuthenticated, (req, res) => {
  // Inputs
  const email = req.body.email.toLowerCase().replace(/\s+/g, '')
  const fullName = req.body.fullName
  const firstPassword = req.body.firstPassword
  const secondPassword = req.body.secondPassword
  // Name Regex
  const nameRegex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
  // Email Regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  // Input Validation
  error = []
  // Remember to add error messages later
  if (emailRegex.test(email) === false) {
    error.push({ text: 'Email fail' })
    return console.log('It email regex failed')
  }
  // if (nameRegex.test(fullName) === false) {
  //  console.log(nameRegex.test(fullName))
  //   console.log(fullName)
  //   error.push({ text: 'Name fail' })
  //   console.log('It name regex failed')
  // }
  if (firstPassword.length < 8) {
    error.push({ text: 'password length fail' })
    console.log('It password length is less than 8 charaters')
  }
  if (firstPassword !== secondPassword) {
    error.push({ text: 'password not same fail' })
    console.log('Password are not the same')
  }
  if (error.length > 0) {
    // reject register
    res.render('user/register')
    // res.redirect('/user/register')
  } else {
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(firstPassword, salt, function (err, hash) {
        password = hash
        userid = uuidv1()
        User.create({ id: userid, fullName, email, password, isAgent: false, isAdmin: false })// .then((user) => {
        //   jwt.sign({ user: userid }, secret, { expiresIn: '1d' },
        //     (err, emailToken) => {
        //       const url = `https://localhost:8080/user/confirmation/${emailToken}`
        //       console.log(url)
        //       transporter.sendMail({
        //         to: req.body.email,
        //         subject: 'Confirm Email',
        //         html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`
        //       })
        //         .catch((err) => {
        //           console.log(err)
        //         })
        //     })
        // })
      })
    })
    res.redirect('/user/login')
  }
})

// Logs in user
router.post('/login', checkNotAuthenticated, (req, res, next) => {
  // Inputs
  const email = req.body.email.toLowerCase().replace(/\s+/g, '')
  const password = req.body.password

  // let errors = []

  // Email Regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  // Input Validation
  if (emailRegex.test(email) === false || password.length < 8) {
    // Flash the following message below to user
    req.flash('error', 'Please enter valid credentials')
    res.redirect('/user/login')
  } else {
    passport.authenticate('local', {
      successRedirect: '/user/userProfile',
      failureRedirect: '/user/login',
      failureFlash: true
    })(req, res, next)
  }
})

// router.get('/forgetpassword', (req, res) => {
//   const title = "Forget Password"
//     res.redirect('')
//   })

// router.get('/confirmPassword', (req, res) => {
//   const title = "Confirm Password"
//     res.redirect('')
//   })

router.get('/register', checkNotAuthenticated, (req, res) => {
  const title = 'Register'
  res.render('user/register', {
    title
  })
})

// Display User Profile Page
router.get('/userProfile', ensureUserAuthenticated, (req, res) => {
  const title = 'User Profile'
  const activeNavProfile = 'active'

  // Retrieve user info
  const userInfo = req.user
  const userName = userInfo.name
  const userEmail = userInfo.email
  const userPhoneNo = userInfo.phoneNo

  res.render('user/userProfile', { title, userEmail, userName, userPhoneNo, activeNavProfile })
})

router.get('/chat', (req, res) => {
  const title = 'Chat'
  var user = User.userid;
  var listingid = req.params.listing
  Chat.findAll({
    where: {
      userid: user,
      listingid: listingid
    },
    order: [
      ['chatorder', 'ASC']
    ],
    raw: true
  }).then((messages) => {
    res.render('user/chatbot', { messages: messages, title })
  })
    .catch(err => console.log(err))
})

router.post('/chat', (req, res) => {
  message = req.body.userinput
  if (message == '') {
    return
  }
  var userid = User.userid
  var listingid = req.params.listing
  Chat.findOne({
    where: {
      userid: userid,
      listingid: listingid
    },
    order: [
      ['chatorder', 'DESC']
    ]
  }).then((msg) => {
    const msgid = uuid.v1()
    let order = 0
    if (!msg) {
      order = 1
    } else {
      order = msg.chatorder + 1
    }
    const botorder = order + 1

    const intent = getIntent(message)
    intent.then((result) => {
      console.log('Hello2')
      const theIntent = result.result.toString()
      console.log(theIntent)
      console.log("CREATED USER MESSAGE")
      // Create user message
      Chat.create({ messageid: msgid, message: message, chatorder: order, userid: userid, listingid: listingid, isBot: false })
      // Create bot message (NEED TO ADD FUNCTION TO REMOVE ACTUAL RESPONSE)
      const botmsgid = uuid.v1()
      createreturnmsg(theIntent,listingid,botmsgid,botorder,userid)
      res.redirect("chat")
      // Create bot message
    })
  }).catch(err => console.log(err))
})

// Logout Route
// Redirect user to home page
router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router
