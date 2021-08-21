const express = require('express')
const router = express.Router()

// Models
const privateRental = require('../models/PrivateRental')

// Required node modules
const uuid = require('uuid')
const fetch = require('node-fetch')

const baseAPIUrl = 'http://localhost:8000/api/'
const floorRangeSelector = require('../helpers/floorRangeSelector')
const PrivateRental = require('../models/PrivateRental')

// Consolidate check regex for uuid
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Call predict resale API
async function predictHouseRent (postal_district, type, bedrooms, floorSqF, leaseDate) {
  const body = {
    Postal_District: postal_district,
    Type: type,
    No_Bedroom: bedrooms,
    Floor_Area: floorSqF,
    Lease_Commencement_Date: leaseDate

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

// HDB Properties that are currently viewable to customers can be found here
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
// View individual HDB Resale Page
router.get('/rentalListing/:id', (req, res) => {
  const title = 'Rental Properties'
  const secondaryTitle = '304 Blaster Up'

  // Refer to mysql workbench for all property id
  const rentID = req.params.id

  // Redirect to homepage if uuid is invalid
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
    // Will display more information regarding this property later
      .then((PrivateRental) => {
        const rentalPrice = PrivateRental.monthlyRent
        const address = PrivateRental.address
        const houseType = PrivateRental.houseType
        const numberOfBedroom = PrivateRental.numberOfBedroom
        const floorSqm = PrivateRental.floorSqm
        const leaseCommenceDate = PrivateRental.leaseCommenceDate
        const description = PrivateRental.description

        res.render('rental/rentalListing', {
          rentID,
          address,
          title,
          secondaryTitle,
          rentalPrice,
          houseType,
          numberOfBedroom,
          leaseCommenceDate,
          floorSqm,
          description
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
// Fixed data for testing
router.post('/createRental', (req, res) => {
  const title = 'Rental Properties'
  const filterSpecialRegex = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/
  // Inputs
  const RentId = uuid.v4()
  const address = req.body.address1
  const description = req.body.description
  // Will add input validation here later
  const postal_district = req.body.postal_district
  // console.log(postal_district)
  const type = req.body.Type
  const bedrooms = req.body.No_Bedroom

  // Call floor range selector to select floor range from floor level accordingly
  const floorSqF = req.body.floorFt

  // Date related inputs
  const leaseDate = req.body.Lease_Commencement_Date

  // Input Validation
  // if (filterSpecialRegex.test(address) === false) {
  //   return console.log('Address contains special characters')
  // }
  // // if (filterSpecialRegex.test(description) === false) {
  // //   return console.log('Description contains special characters')
  // // }

  // // Check if resale date is at least 5 years from lease commence date
  // const totalMilisecondsPerDay = 1000 * 60 * 60 * 24
  // const yearDiff = ((dateOfSale - leaseStartDate) / totalMilisecondsPerDay) / 365
  // if (yearDiff < 5) {
  //   return console.log('Ensure that resale date is at least 5 years from lease date')
  // }

  // // Call predicting api for public housing
  const rentValue = predictHouseRent(postal_district, type, bedrooms, floorSqF, leaseDate)
  rentValue.then((response) => {
    console.log('postal_district: ', postal_district)
    console.log('type: ', type)
    console.log('bedrooms: ', bedrooms)
    console.log('floorSqF: ', floorSqF)
    console.log('leaseDate: ', leaseDate)
    console.log('Resale Value', rentValue)
    const description = 'Sample Description'
    PrivateRental
      .create({
        id: RentId,
        address: address,
        description: description,
        monthlyRent: Math.round(response),
        houseType: type,
        numberOfBedroom: bedrooms,
        postalDistrict: postal_district,
        floorSqm: floorSqF,
        leaseCommenceDate: leaseDate,
        isViewable: true
      })
      .then((result) => {
        console.log('Testing')
        // Redirect to confirming property page
        // res.redirect('/rental/createListing' + RentId)
        res.redirect('/rental/base')
      })
      .catch((err) => console.log('Error: ' + err))
  })
})

module.exports = router
