const express = require('express')
const router = express.Router()
const hdbResale = require('../models/hdbResale')
const privateResale = require('../models/PrivateResale')
const privateRental = require('../models/PrivateRental')
const uuid = require('uuid')
const moment = require('moment')
const fetch = require('node-fetch')

router.get('/propertysingle', (req, res) => {
  const title = 'Property Single'
  res.render('property/property-single', { title: title })
})

router.get('/propertylist', (req, res) => {
  const title = 'List of Properties'
  res.render('property/property-grid', { title: title })
})

// View individual HDB Resale Page
router.get('/viewPublicResaleListing', (req, res) => {
  const title = 'HDB Resale Listing'
  const secondaryTitle = '304 Blaster Up'

  // Hard Code property ID
  hdbResale
    .findOne({
      where: {
        id: 'b5887725-5f94-4b9c-a599-6b66df5e98eb'
      }
    })
    .then((hdbResaleDetail) => {
      const resalePrice = Math.round(hdbResaleDetail.resalePrice)
      const town = hdbResaleDetail.town
      const flatType = hdbResaleDetail.flatType
      const floorSqm = hdbResaleDetail.floorSqm
      const description = hdbResaleDetail.description
      res.render('property/viewPublicResaleListing', {
        title,
        secondaryTitle,
        resalePrice,
        town,
        flatType,
        floorSqm,
        description
      })
    })
})

// Show create HDB Resale Page
router.get('/createPublicResaleListing', (req, res) => {
  const title = 'Create HDB Resale Listing'
  res.render('property/createPublicResale', { title: title })
})

// Fixed data for testing
router.post('/createPublicResaleListing', (req, res) => {
  // Inputs
  // let
  const address = req.body.address1
  const description = req.body.description
  // let resalePrice = // Call predict function here
  // Will add input validation here later
  const town = req.body.town
  const flatType = req.body.flatType
  const flatModel = req.body.flatModel
  // let flatLevel = req.body.flatLevel // Call function to choose storey range according to user input
  const floorSqm = req.body.floorSqm
  let leaseStartDate = new Date(req.body.leaseCommenceDate)
  let leaseStartYear = leaseStartDate.getFullYear()
  const dateOfSale = new Date(req.body.dateOfSale)
  // dateOfSale = dateOfSale.getFullYear() + "-" + dateOfSale.getMonth()
  // const leaseStartDate = moment(req.body.leaseCommenceDate, 'DD/MM/YYYY')
  // dateOfSale = moment(dateOfSale, 'YYYY-MM')
  const resaleValue = predictPublicResale(dateOfSale, town, flatType, floorSqm, flatModel, leaseStartYear)
  resaleValue.then((response) => {
    console.log('Resale Value', response)
    // console.log(req.body.leaseCommenceDate)
    // console.log(req.body.dateOfSale.getFullYear())
    console.log(leaseStartDate)
    console.log(dateOfSale)
    console.log('Resale Value', resaleValue)
    const description = "Sample Description"
    hdbResale
      .create({
        id: uuid.v4(),
        address: address,
        description: description,
        resalePrice: Math.round(response),
        town: town,
        flatType: flatType,
        flatModel: flatModel,
        flatLevel: '5',
        floorSqm: floorSqm,
        // Issue with dates
        leaseCommenceDate: leaseStartDate,
        resaleDate: dateOfSale
      })
      .then((hdbResale) => {
        console.log("Testing")
        res.send('Created a listing')
      })
      .catch((err) => console.log('Error: ' + err))
  })
})

// Call predict resale API
async function predictPublicResale (dateOfSale, town, flatType, floorSqm, flatModel, leaseStartDate) {
  // router.get('/getResalePrediction', (req, res) => {
  return new Promise((result, err) => {
    const body = {
      type: 'public',
      resale_date: dateOfSale,
      town: town,
      flat_type: flatType,
      storey_range: '06 TO 10',
      floor_area_sqm: floorSqm,
      flat_model: flatModel,
      lease_commence_date: leaseStartDate
    }
    fetch('http://localhost:8000/api/predictResale', {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then((json) => {
        console.log(json)
        result(json)
      })
  // })
  })
}

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
    .then(res => res.json())
    .then(json =>
      res.send(json))
})

module.exports = router
