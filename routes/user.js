const express = require('express')
const router = express.Router()

router.get('/register', (req, res) => {
    const title = 'Register'
    res.render('user/register', { title: title })
  })

router.get('/login', (req, res) => {
    const title = 'Login'
    res.render('user/login', { title: title })
  })

// router.post('/register', (req, res) => {
//     res.redirect('')
//   })

// router.post('/login', (req, res) => {
//     res.redirect('')
//   })

// router.get('/forgetpassword', (req, res) => {
//     res.redirect('')
//   })

module.exports = router
