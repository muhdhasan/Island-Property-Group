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
  res.render('contact', { title: title, success_msg: 'Testing' })
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
