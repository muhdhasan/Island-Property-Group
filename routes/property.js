const express = require('express')
const router = express.Router()
const hdbResale = require('../models/hdbResale')
const privateResale = require('../models/PrivateResale')
const privateRental = require('../models/PrivateRental')
const uuid = require('uuid')
const moment = require('moment')
const fetch = require('node-fetch')
const baseAPIUrl = 'http://localhost:8000/api/'
const floorRangeSelector = require('../helpers/floorRangeSelector')

// Call predict resale API
async function predictPublicResale (dateOfSale, town, flatType, floorRange, floorSqm, flatModel, leaseStartDate) {
  // router.get('/getResalePrediction', (req, res) => {
  return new Promise((result, err) => {
    const body = {
      type: 'public',
      resale_date: dateOfSale,
      town: town,
      flat_type: flatType,
      storey_range: floorRange,
      floor_area_sqm: floorSqm,
      flat_model: flatModel,
      lease_commence_date: leaseStartDate
    }
    fetch(baseAPIUrl+ 'predictResale', {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then((json) => {
        console.log(json)
        result(json)
      })
      .catch((err) => {
        console.log("Error:", err)
      })
  // })
  })
}

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
  const resalePublicID = "4b533aa4-3ee9-4312-ab10-80990d1b78e7"
  // Hard Code property ID
  hdbResale
    .findOne({
      where: {
        id: resalePublicID
      }
    })
    // Will display more information regarding this property later
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
    .catch((err) => {
      console.log('Error', err)
    })
})

// Show create HDB Resale Page
router.get('/createPublicResaleListing', (req, res) => {
  const title = 'Create HDB Resale Listing'
  res.render('property/createPublicResale', { title: title })
})

// Fixed data for testing
router.post('/createPublicResaleListing', (req, res) => {
  const filterSpecialRegex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
  // Inputs
  // let
  const address = req.body.address1
  const description = req.body.description
  // let resalePrice = // Call predict function here
  // Will add input validation here later
  const town = req.body.town
  const flatType = req.body.flatType
  const flatModel = req.body.flatModel
  const flatLevel = req.body.flatLevel
  const floorRange = floorRangeSelector(req.body.flatLevel)
  const floorSqm = req.body.floorSqm
  const leaseStartDate = new Date(req.body.leaseCommenceDate)
  const leaseStartYear = leaseStartDate.getFullYear()
  const dateOfSale = new Date(req.body.dateOfSale)

  // Input Validation
  if (filterSpecialRegex.test(address) === false){
    return console.log('Address contains special characters')
  }
  if (filterSpecialRegex.test(description) === false){
    return console.log('Description contains special characters')
  }
  if (filterSpecialRegex.test(address) === false){
    return console.log('Address contains special characters')
  }
  if (filterSpecialRegex.test(address) === false){
    return console.log('Address contains special characters')
  }

  // dateOfSale = dateOfSale.getFullYear() + "-" + dateOfSale.getMonth()
  // const leaseStartDate = moment(req.body.leaseCommenceDate, 'DD/MM/YYYY')
  // dateOfSale = moment(dateOfSale, 'YYYY-MM')
  const resaleValue = predictPublicResale(dateOfSale, town, flatType, floorRange, floorSqm, flatModel, leaseStartYear)
  resaleValue.then((response) => {
    console.log('Resale Value', response)
    // console.log(req.body.leaseCommenceDate)
    // console.log(req.body.dateOfSale.getFullYear())
    console.log(leaseStartDate)
    console.log(dateOfSale)
    console.log('Resale Value', resaleValue)
    const description = 'Sample Description'
    hdbResale
      .create({
        id: uuid.v4(),
        address: address,
        description: description,
        resalePrice: Math.round(response),
        town: town,
        flatType: flatType,
        flatModel: flatModel,
        flatLevel: flatLevel,
        floorSqm: floorSqm,
        leaseCommenceDate: leaseStartDate,
        resaleDate: dateOfSale
      })
      .then((hdbResale) => {
        console.log('Testing')
        // Redirect to confirming property page
        res.send('Created a listing')
      })
      .catch((err) => console.log('Error: ' + err))
  })
})

// View individual HDB Resale Page
// router.get('/viewPrivateResaleListing', (req, res) => {
// })

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
