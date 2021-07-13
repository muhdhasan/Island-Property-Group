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
    fetch(baseAPIUrl + 'predictResale', {
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
        console.log('Error:', err)
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
  const resalePublicID = '4b533aa4-3ee9-4312-ab10-80990d1b78e7' // req.params.id
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
  res.render('property/createPublicResale', { title })
})

// Fixed data for testing
router.post('/createPublicResaleListing', (req, res) => {
  const filterSpecialRegex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
  // Inputs
  // let
  const address = req.body.address1
  const description = req.body.description
  // Will add input validation here later
  const town = req.body.town
  const flatType = req.body.flatType
  const flatModel = req.body.flatModel
  const flatLevel = req.body.flatLevel

  // Call floor range selector to select floor range from floor level accordingly
  const floorRange = floorRangeSelector(req.body.flatLevel)
  const floorSqm = req.body.floorSqm

  // Date related inputs
  const leaseStartDate = new Date(req.body.leaseCommenceDate)
  const leaseStartYear = leaseStartDate.getFullYear()
  const dateOfSale = new Date(req.body.dateOfSale)

  // Input Validation
  if (filterSpecialRegex.test(address) === false) {
    return console.log('Address contains special characters')
  }
  if (filterSpecialRegex.test(description) === false) {
    return console.log('Description contains special characters')
  }
  if (filterSpecialRegex.test(address) === false) {
    return console.log('Address contains special characters')
  }
  if (filterSpecialRegex.test(address) === false) {
    return console.log('Address contains special characters')
  }

  // dateOfSale = dateOfSale.getFullYear() + "-" + dateOfSale.getMonth()
  // const leaseStartDate = moment(req.body.leaseCommenceDate, 'DD/MM/YYYY')
  // dateOfSale = moment(dateOfSale, 'YYYY-MM')
  const resaleValue = predictPublicResale(dateOfSale, town, flatType, floorRange, floorSqm, flatModel, leaseStartYear)
  resaleValue.then((response) => {
    console.log('Resale Value', response)
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

// Edit Function
router.get('/editPublicResaleListing/:id', (req, res) => {
  const title = 'Edit HDB Resale Listing'
  const publicResaleId = '4b533aa4-3ee9-4312-ab10-80990d1b78e7'// req.params.id
  // Find hdb property by id
  hdbResale.findOne({
    where: { id: publicResaleId }
  }).then((result) => {
    // display result from database
    const address = result.address
    const description = result.description
    const town = result.town
    const flatType = result.flatType
    const flatModel = result.flatModel
    const floorLevel = parseInt(result.flatLevel)
    const floorSqm = result.floorSqm
    const leaseCommenceDate = result.leaseCommenceDate
    const resaleDate = result.resaleDate
    // Render property values from database
    res.render('property/editPublicResale', {
      title,
      address,
      town,
      flatType,
      flatModel,
      floorLevel,
      floorSqm,
      leaseCommenceDate,
      resaleDate
    })
  }).catch((err) => console.log('Error: ', err))
})

// Basic Delete Function
// Delete hdb resale listing
router.get('/deletePublicResaleListing/:id', (req, res) => {
  const publicResaleId = req.params.id
  // hdbResale.findOne({
  //   where: { id: hdbResaleId }
  // }).then((result) => {
  // })
  hdbResale.destroy({
    where: { id: publicResaleId }
  }).then((result) => {
    console.log(result)
    res.send('Deleted Public Resale Listing')
  }).catch((err) => { console.log('Error: ', err) })
})

// View individual private Resale Page
// router.get('/viewPrivateResaleListing', (req, res) => {
//   const resalePrivateID = req.params.id
// })

// Display create resale listing page
router.get('/createPrivateResaleListing', (req, res) => {
  const title = 'Create Private Resale Listing'
  res.send('Created private resale listing')
})

// Create listing for private resale property
router.post('/createPrivateResaleListing', (req, res) => {
  // const address = req.body.address
  // const description = "Sample Description"

  // Date related inputs
  // const leaseStartDate = new Date(req.body.leaseCommenceDate)
  // const leaseStartYear = leaseStartDate.getFullYear()
  // const dateOfSale = new Date(req.body.dateOfSale)
  // privateResale.create({
  //   id: uuid.V4(),
  //   address: address,
  //   description: description,
  // }).then((result) => {
  //   res.send("Created private resale listing")
  // }).catch((err) => { console.log('Error: ', err) })
  res.send('Created private resale listing')
})

// Basic Delete Function
// Delete private resale listing
router.get('/deletePrivateResaleListing/:id', (req, res) => {
  const privateResaleId = req.params.id
  privateResale.destroy({
    where: { id: privateResaleId }
  }).then((result) => {
    console.log(result)
    res.send('Deleted Private Resale Listing')
  }).catch((err) => { console.log('Error: ', err) })
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
    .then(res => res.json())
    .then(json =>
      res.send(json))
    .catch((err) => { console.log('Error: ', err) })
})

module.exports = router
