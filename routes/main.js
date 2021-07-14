const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')

router.get('/', (req, res) => {
  const title = 'Home'
  const activeNavOne = 'active'
  res.render('index', { title, activeNavOne })
})

router.get('/about', (req, res) => {
  const title = 'About Us'
  const activeNavTwo = 'active'
  res.render('about', { title, activeNavTwo })
})

router.get('/contact', (req, res) => {
  const title = 'Contact Us'
  const activeNavContact = 'active'
  res.render('contact', { title, success_msg: 'Testing', activeNavContact })
})

// Test api call here
router.get('/testRoute', (req, res) => {
  const body = {
    a: 10,
    b: 5
  }
  fetch('http://localhost:8000/api/test', {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
    .then((res) => res.json())
    .then((json) => res.send(json))
})

module.exports = router
