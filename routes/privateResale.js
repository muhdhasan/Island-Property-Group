const express = require('express')
const router = express.Router()

// Model
const privateResale = require('../models/PrivateResale')

// Required node modules
const uuid = require('uuid')
const moment = require('moment')
const fetch = require('node-fetch')

// Base URL String
const baseAPIUrl = process.env.baseAPIUrl || 'http://localhost:8000/api/'

const floorRangeSelector = require('../helpers/floorRangeSelector')

// Middlewares
const { checkUUIDFormat, checkResalePublicListingId, checkResalePrivateListingId } = require('../helpers/checkURL')
const { ensureUserAuthenticated, checkAgentAuthenticated } = require('../helpers/auth')

// Call predict resale API for private properties
async function predictPrivateResale (houseType, postalDistrict,
  marketSegement, typeOfArea, floorRange, dateOfSale, floorSqm,
  isFreehold, leaseDuration, leaseCommenceDate) {
  const body = {
    type: 'private',
    house_type: houseType,
    postal_district: postalDistrict,
    market_segment: marketSegement,
    type_of_area: typeOfArea,
    floor_level: floorRange,
    resale_date: dateOfSale,
    floor_area_sqm: floorSqm,
    is_freehold: isFreehold,
    lease_duration: leaseDuration,
    lease_commence_date: leaseCommenceDate
  }
  return new Promise((result, err) => {
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
  })
}

//  CURRENTLY SHIFTING CODE RELATED TO PRIVATE RESALE TO THIS FILE

// Display create resale listing page
router.get('/create', checkAgentAuthenticated, (req, res) => {
  const title = 'Create Private Resale Listing'
  res.render('privateResale/createListing', { title })
})

// Create listing for private resale property
router.post('/create', checkAgentAuthenticated, (req, res) => {
  // Create UUID
  const id = uuid.v4()

  // Inputs
  const address = req.body.address
  const propertyName = req.body.propertyName
  const description = 'Sample Description'
  const postalCode = req.body.postalCode
  const postalDistrict = req.body.postalDistrict
  const houseType = req.body.houseType
  const typeOfArea = req.body.typeOfArea
  const marketSegment = req.body.marketSegment
  const floorSqm = req.body.floorSqm
  const floorLevel = req.body.floorLevel
  const usePrediction = req.body.usePrediction

  // Call floor range selector to select floor range from floor level accordingly
  const floorRange = floorRangeSelector(req.body.floorLevel)

  // Date related inputs
  const leaseCommenceDate = new Date(req.body.leaseCommenceDate)
  const leaseStartYear = leaseCommenceDate.getFullYear()
  const resaleDate = new Date(req.body.dateOfSale)

  // Call predicting api for private resale housing
  const resaleValue = predictPrivateResale(houseType, postalDistrict, marketSegment, typeOfArea, floorRange, resaleDate, floorSqm, 1, 0, leaseCommenceDate)
  resaleValue.then((response) => {

    const predictedValue = Math.round(response)

    // If user wants to display prediction from AI
    if (Boolean(usePrediction) === true) {
      // Create private resale listing
      privateResale.create({
        id,
        address,
        propertyName,
        description,
        resalePrice: predictedValue,
        predictedValue,
        houseType,
        typeOfArea,
        marketSegment,
        postalDistrict,
        floorSqm,
        floorLevel,
        leaseCommenceDate,
        resaleDate,
        postalCode,
        isViewable: false,
        usePrediction
      }).then(() => {
        console.log('Created private resale listing')
        res.redirect('/property/confirmPrivateResaleListing/' + id)
      }).catch((err) => { console.log('Error in creating private resale listing: ', err) })
    }
    // If we want to display entered resale value instead of predicted value
    // Save resale value input and display it
    else {
      // Create private resale listing
      const resalePrice = Math.round(req.body.resaleValue)
      privateResale.create({
        id,
        address,
        description,
        resalePrice,
        predictedValue,
        houseType,
        typeOfArea,
        marketSegment,
        postalDistrict,
        floorSqm,
        floorLevel,
        leaseCommenceDate,
        resaleDate,
        postalCode,
        isViewable: false,
        usePrediction
      }).then(() => {
        console.log('Created private resale listing')
        res.redirect('/property/confirmPrivateResaleListing/' + id)
      }).catch((err) => { console.log('Error in creating private resale listing: ', err) })
    }
  })
})

module.exports = router
