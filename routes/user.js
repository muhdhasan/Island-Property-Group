const express = require('express')
const router = express.Router()
// const bcrypt = require('bcrypt');

router.get('/register', (req, res) => {
  const title = 'Register'
  res.render('user/register', { title: title })
})

router.get('/login', (req, res) => {
  const title = 'Login'
  res.render('user/login', { title: title })
})

// router.post('/register', (req, res) => {
//    const email = req.body.email.toLowerCase().replace(/\s+/g, '')
//    res.redirect('')
//   })

// Logs in user
router.post('/login', (req, res) => {
  // Inputs
  const email = req.body.email.toLowerCase().replace(/\s+/g, '')
  const password = req.body.password

  // Email Regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  // Input Validation
  if (emailRegex.test(email) === false || password.length < 8) return console.log('It failed')

  res.redirect('#')
})

// router.get('/forgetpassword', (req, res) => {
//   const title = "Forget Password"
//     res.redirect('')
//   })

// router.get('/confirmPassword', (req, res) => {
//   const title = "Confirm Password"
//     res.redirect('')
//   })

router.get('/userProfile', (req, res) => {
  const title = "User Profile"
  res.render('user/userProfile', {title: title})
})

// Logout Route
// Redirect user to home page
router.get('/logout', (req, res) => {
  req.logOut()
  res.redirect('/')
})

module.exports = router
