const express = require('express')
const router = express.Router()
const passport = require('passport')
// const request = require('request')
const user = require('../models/User')
const nodemailer = require('nodemailer')
// const bcrypt = require('bcrypt');

router.get('/register', (req, res) => {
  const title = 'Register'
  res.render('user/register', { title })
})

router.get('/login', (req, res) => {
  const title = 'Login'
  res.render('user/login', { title })
})

router.post('/register', (req, res) => {
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

  // Remember to add error messages later
  if (emailRegex.test(email) === false) {
    return console.log('It email regex failed')
  }
  if (nameRegex.test(fullName) === false) {
    return console.log('It name regex failed')
  }
  if (firstPassword.length < 8) {
    return console.log('It password length is less than 8 charaters')
  }
  if (firstPassword !== secondPassword) {
    return console.log('Password are not the same')
  }
  res.redirect('#')
})

// Logs in user
router.post('/login', (req, res) => {
  // Inputs
  console.log(req.body)
  const email = req.body.email.toLowerCase().replace(/\s+/g, '')
  console.log(email)
  const password = req.body.password

  // Email Regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  // Input Validation
  if (emailRegex.test(email) === false || password.length < 8) return console.log('It failed')

  res.send('It works')
})

// router.get('/forgetpassword', (req, res) => {
//   const title = "Forget Password"
//     res.redirect('')
//   })

// router.get('/confirmPassword', (req, res) => {
//   const title = "Confirm Password"
//     res.redirect('')
//   })

const transporter = nodemailer.createTransport({
  host: 'smtp.googlemail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'superlegitemail100percent@gmail.com', // generated ethereal user
    pass: 'Passw0rdyes' // generated ethereal password
  }
})

router.get('/register', (req, res) => {
  const title = 'Register'
  res.render('user/register', {
    title
  })
})

// router.post('/register', (req, res) => {
//     const errors = []
//     let { email, name, password, password2 } = req.body
//     if (password !== password2) {
//       errors.push({ text: 'Passwords do not match' })
//     }
//     if (password.length < 4) {
//       errors.push({ text: 'Password must be at least 4 characters' })
//     }
//     if (errors.length > 0) {
//       res.render('user/register', {
//         errors,
//         name,
//         email,
//         password,
//         password2
//       })
//     } else {
//       User.findOne({ where: { email: req.body.email } }).then((user) => {
//         if (user) {
//           res.render('user/register', {
//             errors: user.email + ' already registered',
//             name,
//             email,
//             password,
//             password2
//           })
//         } else {
//           bcrypt.genSalt(10, function (err, salt) {
//             if (err) return next(err)
//             bcrypt.hash(password, salt, function (err, hash) {
//               if (err) return next(err)
//               password = hash
//               theid = uuidv1()
//               User.create({
//                 id: theid,
//                 name,
//                 email,
//                 password,
//                 isadmin: false,
//                 confirmed: false
//               }).then((user) => {
//                 alertMessage(
//                   res,
//                   'success',
//                   user.name + ' added.Please Verify you account',
//                   'fas fa-sign-in-alt',
//                   true
//                 )
//                 jwt.sign(
//                   {
//                     user: theid
//                   },
//                   SECRET,
//                   {
//                     expiresIn: '1d'
//                   },
//                   (err, emailToken) => {
//                     const url = `https://localhost:5000/user/confirmation/${emailToken}`
//                     console.log(url)
//                     transporter.sendMail({
//                       to: req.body.email,
//                       subject: 'Confirm Email',
//                       html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`
//                     })
//                   }
//                 )
//                 res.redirect('/user/login')
//               })
//             })
//           })
//         }
//       })
//     }
// })

// router.get('/confirmation/:token', async (req, res) => {
//     const token = jwt.verify(req.params.token, SECRET)
//     User.findOne({ where: { id: token.user } }).then((user) => {
//       user.update({ confirmed: true })
//       console.log('email verified')
//     })
//     alertMessage(res, 'success', 'account confirmed', 'fas fa-sign-in-alt', true)
//     res.redirect('https://localhost:5000/user/login')
//   })

router.get('/userProfile', (req, res) => {
  const title = 'User Profile'
  res.render('user/userProfile', { title })
})

// Logout Route
// Redirect user to home page
router.get('/logout', (req, res) => {
  req.logOut()
  res.redirect('/')
})

module.exports = router
