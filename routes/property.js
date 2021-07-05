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


router.get('/createPublicResaleListing', (req, res) => {
  const title = 'Create HDB Resale Listing'
  res.render('property/createPublicResale', { title: title })
})

// Fixed data for testing
router.post('/createPublicResaleListing', (req, res) => {

  // Inputs
  // let 
  // let address = req.body.address
  // let description = req.body.description
  // let resalePrice = // Call predict function here
  let town = req.body.town
  let flatType = req.body.flatType
  let flatModel = req.body.flatModel
  // let flatLevel = req.body.flatLevel // Call function to choose storey range according to user input
  // let floorSqm = req.body.floorSqm
  // let leaseStartDate = moment(req.body.leaseCommenceDate,'DD/MM/YYYY')
  // let dateOfSale = moment(req.body.resaleDate,'DD/MM/YYYY')

  // Will add input validation here later

  hdbResale.create({
    id: uuid.v4(),
    address: "Sample Address",
    description: "Sample Description",
    resalePrice: 500000,
    town: town,
    flatType: flatType,
    flatModel: flatModel,
    flatLevel: "5",
    floorSqm: 90,
    // Issue with dates
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
