const express = require('express')
const router = express.Router()

// Required node modules
const fetch = require('node-fetch')

// Base URL String
const baseAPIUrl = process.env.baseAPIUrl || 'http://localhost:8000/api/'

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
  res.render('contact', { title, activeNavContact })
})

// Call predict resale API
async function test (msg) {
  // router.get('/getResalePrediction', (req, res) => {
  const body = {
    userInput: 'hello'
  }
  return new Promise((result, err) => {
    fetch(baseAPIUrl + 'chatbot', {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then((json) => {
        // console.log(json)
        result(json)
      })
      .catch((err) => {
        console.log('Error:', err)
      })
  // })
  })
}

// Test api call here
router.get('/testRoute', (req, res) => {
  const predictedValue = test('hello')
  predictedValue.then((result) => {
    // var test = JSON.parse(result)
    console.log(result.result)
    res.send('hello')
  })
})

module.exports = router
