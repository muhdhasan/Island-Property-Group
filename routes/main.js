const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  const title = 'Home'
  res.render('index', { title: title })
})

router.get('/about', (req, res) => {
  const title = 'About Us'
  res.render('about', { title: title })
})

router.get('/contact', (req, res) => {
  const title = 'Contact Us'
  res.render('contact', { title: title })
})

module.exports = router
