const express = require('express')
const router = express.Router()
const passport = require('passport')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const sanitize = require('sanitize')()
const { v1: uuidv1 } = require('uuid')
const jwt = require('jsonwebtoken')
const user = require('../models/User')
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

router.get('/register', checkNotAuthenticated,  (req, res) => {
  const title = 'Register'
  res.render('user/register', { title })
})

router.get('/login', checkNotAuthenticated ,(req, res) => {
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

// router.get('/confirmation/:token', async (req, res) => {
//   const token = jwt.verify(req.params.token, SECRET)
//   User.findOne({ where: { id: token.user } }).then((user) => {
//     user.update({ confirmed: true })
//     console.log('email verified')
//   })
//   // This function below is not defined
//   alertMessage(res, 'success', 'account confirmed', 'fas fa-sign-in-alt', true)
//   res.redirect('https://localhost:8080/user/login')
// })

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

  // Retrieve user info
  const userInfo = req.user
  const userName = userInfo.name
  const userEmail = userInfo.email
  const userPhoneNo = userInfo.phoneNo

  res.render('user/userProfile', { title, userEmail, userName, userPhoneNo })
})

// Logout Route
// Redirect user to home page
router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router
