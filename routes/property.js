const express = require('express')
const router = express.Router()
const hdbResale = require('../models/hdbResale')
const privateResale = require('../models/PrivateResale')
const privateRental = require('../models/PrivateRental')
const uuid = require('uuid')
const moment = require('moment')

router.get('/propertysingle', (req, res) => {
  const title = 'Property Single'
  res.render('property/property-single', { title: title })
})

router.get('/propertylist', (req, res) => {
  const title = 'List of Properties'
  res.render('property/property-grid', { title: title })
})

// router.get('/createPropertyResaleListing', (req, res) => {
//   const title = 'List of Properties'
//   res.render('property/property-grid', { title: title })
// })

// Fixed data for testing
router.post('/createPublicResaleListing', (req, res) => {

  //let 



  hdbResale.create({
    id: uuid.v4(),
    address: "Sample Address",
    description: "Sample Description",
    resalePrice: 500000,
    town: "ANG MO KIO",
    flatType: "5 Room",
    flatModel: "IMPROVED",
    flatLevel: "5",
    floorSqm: 90,
    // Issue with datess
    leaseCommenceDate: 25/06/2000,
    resaleDate: 25/06/2020
  }) .then((hdbResale) => {
    res.send("Created a listing")
  })
  .catch(err => console.log("Error: " + err))
})

// Test api call here
// router.get('/testRoute', (req, res) => {
//   const body = {
//     a: 10,
//     b: 5
//   }
//   fetch('http://localhost:8000/api/test', {
//     method: 'post',
//     body: JSON.stringify(body),
//     headers: { 'Content-Type': 'application/json' }
//   })
//     .then(res => res.json())
//     .then(json =>
//       res.send(json))
// })

module.exports = router
