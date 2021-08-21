const express = require('express')
const router = express.Router()

// Models
const privateRental = require('../models/PrivateRental')

// Required node modules
const uuid = require('uuid')
const moment = require('moment')
const fetch = require('node-fetch')

const baseAPIUrl = process.env.baseAPIUrl || 'http://localhost:8000/api/'
const floorRangeSelector = require('../helpers/floorRangeSelector')
const PrivateRental = require('../models/PrivateRental')

// Consolidate check regex for uuid
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Call predict rental API
async function predictHouseRent(postal_district, type, bedrooms, floorSqF, leaseDate) {

  const body = {
    Postal_District: postal_district,
    Type: type,
    No_Bedroom: bedrooms,
    Floor_Area: floorSqF,
    Lease_Commencement_Date: leaseDate,

  }
  return new Promise((result, err) => {
    fetch(baseAPIUrl + 'predictRental', {
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
// Rental Properties that are viewable to customers
router.get('/base', (req, res) => {
  const title = 'Rental Properties'
  privateRental.findAll({
    // Only users can see viewable properties
    where: {
      isViewable: true
    },
    raw: true

  }).then((privateRental) => {
    res.render('rental/base', { title, privateRental: privateRental })
  })
})

// View each Rental Properties Page
router.get('/rentalListing/:id', (req, res) => {
  const title = 'Rental Properties'
  const secondaryTitle = '304 Blaster Up'

  // Store ID in sql database
  const rentID = req.params.id

  // Redirect to homepage 
  if (uuidRegex.test(rentID) === false) {
    res.redirect('/')
  } else {
    PrivateRental
      .findOne({
        where: {
          id: rentID,
          isViewable: true
        }
      })
      // Display information
      .then((PrivateRental) => {
        const rentalPrice = PrivateRental.monthlyRent
        const address = PrivateRental.address
        const houseType = PrivateRental.houseType
        const numberOfBedroom = PrivateRental.numberOfBedroom
        const floorSqm = PrivateRental.floorSqm
        const leaseCommenceDate = PrivateRental.leaseCommenceDate
        const description = PrivateRental.description
        const amenities = PrivateRental.amenities
        const postalDistrict = PrivateRental.postalDistrict

        const annualprice = Math.round(rentalPrice * 12).toFixed(2)
        const downpayment = Math.round(rentalPrice * 3).toFixed(2)
        const priceperSqm = rentalPrice/floorSqm
        res.render('rental/rentalListing', {
          address,
          title,
          secondaryTitle,
          rentalPrice,
          houseType,
          numberOfBedroom,
          leaseCommenceDate,
          amenities,
          floorSqm,
          description,
          postalDistrict,
          rentID,
          annualprice,
          downpayment,
          priceperSqm
        })
      })
      .catch((err) => {
        console.log('Error', err)
      })
  }
})
router.get('/createRental', (req, res) => {
  const title = 'Rental Properties'
  res.render('rental/createRental', { title: title })
})

router.post('/createRental', (req, res) => {
  const title = 'Rental Properties'
  const filterSpecialRegex = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/
  // Inputs
  const RentId = uuid.v4()
  const address = req.body.address1
  const description = req.body.description
  const postal_district = req.body.postal_district
  const type = req.body.Type
  const bedrooms = req.body.No_Bedroom
  const floorSqF = req.body.floorFt
  const leaseDate = req.body.Lease_Commencement_Date
  const amenities = req.body.amenities

  // Call predicting api for rental
  const rentValue = predictHouseRent(postal_district, type, bedrooms, floorSqF, leaseDate)
  rentValue.then((response) => {
    // console.log('postal_district: ', postal_district)
    // console.log('type: ', type)
    // console.log('bedrooms: ', bedrooms)
    // console.log('floorSqF: ', floorSqF)
    // console.log('leaseDate: ', leaseDate)
    // console.log('Resale Value', rentValue)
    // const description = 'Sample Description'

    PrivateRental
      .create({
        id: RentId,
        address: address,
        description: description,
        amenities: amenities,
        monthlyRent: Math.round(response),
        houseType: type,
        numberOfBedroom: bedrooms,
        postalDistrict: postal_district,
        floorSqm: floorSqF,
        leaseCommenceDate: leaseDate,
        isViewable: true
      })
      .then((result) => {
        console.log('Returning to homepage')
        res.redirect('/rental/base')
      })
      .catch((err) => console.log('Error: ' + err))
  })
})
// Edit Function for rental listings
router.get('/editRentalListing/:id', (req, res) => {
  const title = 'Edit Rental Listing'

  const rentID = req.params.id
  // Find rental property by id
  PrivateRental.findOne({
    where: { id: rentID }
  }).then((PrivateRental) => {
    // Getting result from database
    const rentalPrice = PrivateRental.monthlyRent
    const address = PrivateRental.address
    const houseType = PrivateRental.houseType
    const numberOfBedroom = PrivateRental.numberOfBedroom
    const floorSqm = PrivateRental.floorSqm
    const leaseCommenceDate = PrivateRental.leaseCommenceDate
    const postalDistrict = PrivateRental.postal_district
    const description = PrivateRental.description
    const amenities = PrivateRental.amenities

    res.render('rental/editRentalListing', {
      address,
      title,
      rentalPrice,
      houseType,
      numberOfBedroom,
      leaseCommenceDate,
      postalDistrict,
      floorSqm,
      description,
      amenities,
      rentID
    })
  }).catch((err) => console.log('Error: ', err))
})
// Update rental property information to database
router.put('/editRentalListing/:id', (req, res) => {

  const rentID = req.params.id

  const filterSpecialRegex = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/

  // Inputs
  const address = req.body.address
  const postal_district = req.body.postal_district
  const description = req.body.description
  const bedrooms = req.body.No_Bedroom
  const type = req.body.Type
  const floorSqF = req.body.floorFt
  const leaseDate = req.body.leaseCommenceDate
  const amenities = req.body.amenities

  // Call predicting api for rental property
  const rentValue = predictHouseRent(postal_district, type, bedrooms, floorSqF, leaseDate)
  rentValue.then((response) => {
    // console.log('postal_district: ', postal_district)
    // console.log('type: ', type)
    // console.log('bedrooms: ', bedrooms)
    // console.log('floorSqF: ', floorSqF)
    // console.log('leaseDate: ', leaseDate)
    // console.log('Resale Value', rentValue)
    // const description = 'Sample Description'
    // Update rental listing according to id
    PrivateRental.update({
      address: address,
      description: description,
      amenities: amenities,
      monthlyRent: Math.round(response),
      houseType: type,
      numberOfBedroom: bedrooms,
      postalDistrict: postal_district,
      floorSqm: floorSqF,
      leaseCommenceDate: leaseDate,
    }, {
      where: { id: rentID }
    }).then(() => {
      res.redirect('/rental/base')
    }).catch((err) => { console.log('Error in updating Rental Listing: ', err) })
  })
})

// Delete rental listing
router.get('/deleteRentalListing/:id', (req, res) => {
  const rentID = req.params.id
  PrivateRental.destroy({
    where: { id: rentID }
  }).then(() => {
    console.log('Deleted rental listing')
    res.redirect('/rental/base')
  }).catch((err) => { console.log('Error: ', err) })
})
module.exports = router