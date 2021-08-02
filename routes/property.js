const express = require('express')
const router = express.Router()

// Models
const hdbResale = require('../models/hdbResale')
const privateResale = require('../models/PrivateResale')

// Required node modules
const uuid = require('uuid')
const moment = require('moment')
const fetch = require('node-fetch')

// Base URL String
const baseAPIUrl = 'http://localhost:8000/api/' // process.env.baseAPIUrl

// Helpers
const floorRangeSelector = require('../helpers/floorRangeSelector')
const { checkUUIDFormat, checkResalePublicListingId, checkResalePrivateListingId } = require('../helpers/checkURL')
const { ensureUserAuthenticated, checkAgentAuthenticated } = require('../helpers/auth')

// Call predict resale API for HDB properties
async function predictPublicResale (dateOfSale, town, flatType,
  floorRange, floorSqm, flatModel, leaseStartDate) {
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

// Router is placed according to CRUD order where you'll see create function then followed by retrieve and etc

// Reference
router.get('/propertysingle', (req, res) => {
  const title = 'Property Single'
  res.render('resale/property-single', { title: title })
})

router.get('/propertylist', (req, res) => {
  const title = 'List of Properties'
  res.render('resale/property-grid', { title: title })
})

// Show create HDB Resale Page
router.get('/createPublicResaleListing', checkAgentAuthenticated, (req, res) => {
  const title = 'Create HDB Resale Listing'
  res.render('resale/createPublicResale', { title })
})

// Fixed data for testing
router.post('/createPublicResaleListing', checkAgentAuthenticated, (req, res) => {

  const filterSpecialRegex = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/
  // Inputs
  const hdbResaleId = uuid.v4()
  const address = req.body.address
  const blockNo = req.body.blockNo
  const description = req.body.description
  const postalCode = req.body.postalCode
  // Will add input validation here later
  const town = req.body.town
  const flatType = req.body.flatType
  const flatModel = req.body.flatModel
  const flatLevel = req.body.flatLevel
  const useAIOption = req.body.usePrediction

  // Call floor range selector to select floor range from floor level accordingly
  const floorRange = floorRangeSelector(req.body.flatLevel)
  const floorSqm = req.body.floorSqm

  // Date related inputs
  const leaseStartDate = new Date(req.body.leaseCommenceDate)
  const leaseStartYear = leaseStartDate.getFullYear()
  const dateOfSale = new Date(req.body.dateOfSale)

  // Input Validation
  // if (filterSpecialRegex.test(address) === false) {
  //   return console.log('Address contains special characters')
  // }
  // if (filterSpecialRegex.test(description) === false) {
  //   return console.log('Description contains special characters')
  // }
  // if (filterSpecialRegex.test(address) === false) {
  //   return console.log('Address contains special characters')
  // }
  // if (filterSpecialRegex.test(address) === false) {
  //   return console.log('Address contains special characters')
  // }

  // Check if resale date is at least 5 years from lease commence date
  const totalMilisecondsPerDay = 1000 * 60 * 60 * 24
  const yearDiff = ((dateOfSale - leaseStartDate) / totalMilisecondsPerDay) / 365
  if (yearDiff < 5) {
    return console.log('Ensure that resale date is at least 5 years from lease date')
  }

  // Call predicting api for public resale housing
  const resaleValue = predictPublicResale(dateOfSale, town, flatType, floorRange, floorSqm, flatModel, leaseStartYear)
  resaleValue.then((response) => {
    console.log('Resale Value', response)
    const description = 'Sample Description'

    // // If user wants to use prediction from AI
    // if(useAIOption === "yesPredict"){
    //   const resaleValue = response
    //   return resaleValue
    // }
    // else{
    //   const resaleValue = req.body.resaleValue
    // }

    // Create public resale listing
    hdbResale
      .create({
        id: hdbResaleId,
        address,
        blockNo,
        description,
        resalePrice: Math.round(response),
        town,
        flatType,
        flatModel,
        flatLevel,
        floorSqm,
        leaseCommenceDate: leaseStartDate,
        resaleDate: dateOfSale,
        postalCode,
        isViewable: false
      })
      .then(() => {
        console.log('Created HDB Resale Listing')
        // Redirect to confirming property page
        res.redirect('confirmPublicResaleListing/' + hdbResaleId)
      })
      .catch((err) => console.log('Error: ' + err))
  })
})

// View individual HDB Resale Page
router.get('/viewPublicResaleListing/:id', checkUUIDFormat, checkResalePublicListingId, (req, res) => {
  const title = 'HDB Resale Listing'
  const secondaryTitle = '304 Blaster Up'

  // Refer to mysql workbench for all property id
  const resalePublicID = req.params.id
  hdbResale
    .findOne({
      where: {
        id: resalePublicID,
        isViewable: true
      }
    })
    // Will display more information regarding this property later
    .then((hdbResaleDetail) => {
      const resalePrice = Math.round(hdbResaleDetail.resalePrice)
      const address = hdbResaleDetail.address
      const town = hdbResaleDetail.town
      const flatType = hdbResaleDetail.flatType
      const floorSqm = hdbResaleDetail.floorSqm
      const description = hdbResaleDetail.description
      const leaseCommenceDate = hdbResaleDetail.leaseCommenceDate
      const postalCode = hdbResaleDetail.postalCode
      res.render('resale/viewPublicResaleListing', {
        address,
        title,
        secondaryTitle,
        resalePrice,
        town,
        flatType,
        floorSqm,
        description,
        leaseCommenceDate,
        postalCode
      })
    })
    .catch((err) => {
      console.log('Error', err)
    })
})

// HDB Properties that are currently viewable to customers can be found here
router.get('/viewPublicResaleList', (req, res) => {
  const title = 'HDB Resale Listings'
  const isViewable = true
  hdbResale.findAll({
    // Only users can see viewable properties
    where: {
      isViewable: isViewable
    },
    raw: true
  }).then((hdbResale) => {
    res.render('resale/viewPublicResaleList', { title, hdbResale: hdbResale })
  })
})

// Unviewable property listings that customers cannot see
router.get('/viewPreviewPublicList', checkAgentAuthenticated, (req, res) => {
  const title = 'HDB Preview Listings'
  const isViewable = true
  hdbResale.findAll({
    // Only agents can see all properties
    raw: true
  }).then((hdbResale) => {
    res.render('resale/viewPublicResaleList', { title, hdbResale: hdbResale })
  })
})

// Edit Function for public resale listings
router.get('/editPublicResaleListing/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePublicListingId, (req, res) => {
  const title = 'Edit HDB Resale Listing'

  // Get UUID from URL
  const resalePublicID = req.params.id
  // Find hdb property by id
  hdbResale.findOne({
    where: { id: resalePublicID }
  }).then((result) => {
    // Display result from database
    const id = result.id
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
    res.render('resale/editPublicResale', {
      id,
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

// Update public property information to database
router.put('/editPublicResaleListing/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePublicListingId, (req, res) => {
  // Get UUID from URL
  const resalePublicID = req.params.id

  const filterSpecialRegex = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/
  // Inputs
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
  const resaleDate = new Date(req.body.dateOfSale)

  // Input Validation
  // if (filterSpecialRegex.test(address) === false) {
  //   return console.log('Address contains special characters')
  // }
  // if (filterSpecialRegex.test(description) === false) {
  //   return console.log('Description contains special characters')
  // }
  // if (filterSpecialRegex.test(address) === false) {
  //   return console.log('Address contains special characters')
  // }
  // if (filterSpecialRegex.test(address) === false) {
  //   return console.log('Address contains special characters')
  // }

  // Check if resale date is at least 5 years from lease commence date
  const totalMilisecondsPerDay = 1000 * 60 * 60 * 24
  const yearDiff = ((resaleDate - leaseStartDate) / totalMilisecondsPerDay) / 365
  if (yearDiff < 5) {
    return console.log('Ensure that resale date is at least 5 years from lease date')
  }

  // Update hdb resale listing according to UUID
  hdbResale.update({
    address,
    description,
    resalePrice: 500000,
    town,
    flatType,
    flatModel,
    flatLevel,
    floorSqm,
    leaseCommenceDate: leaseStartDate,
    resaleDate
  }, {
    where: { id: resalePublicID }
  }).then(() => {
    // Redirect to confirmation page
    res.redirect('/property/confirmPublicResaleListing/' + resalePublicID)
  }).catch((err) => { console.log('Error in updating hdb resale listing: ', err) })
})

// Confirmation Page for HDB properties
router.get('/confirmPublicResaleListing/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePublicListingId, (req, res) => {
  const title = 'Confirm Resale Listing - Public'

  // Probably need to modify this secondary title
  const secondaryTitle = '304 Blaster Up'

  // Get UUID from URL
  const resalePublicID = req.params.id

  // Find based on uuid V4
  hdbResale
    .findOne({
      where: {
        id: resalePublicID
      }
    })
    // Will display more information regarding this property later
    .then((hdbResaleDetail) => {
      const id = hdbResaleDetail.id
      const resalePrice = Math.round(hdbResaleDetail.resalePrice)
      const address = hdbResaleDetail.address
      const blockNo = hdbResaleDetail.blockNo
      const town = hdbResaleDetail.town
      const flatType = hdbResaleDetail.flatType
      const floorSqm = hdbResaleDetail.floorSqm
      const description = hdbResaleDetail.description
      const leaseCommenceDate = hdbResaleDetail.leaseCommenceDate
      const isViewable = hdbResaleDetail.isViewable
      const postalCode = hdbResaleDetail.postalCode
      res.render('resale/confirmPublicListing', {
        id,
        address,
        blockNo,
        title,
        secondaryTitle,
        resalePrice,
        town,
        flatType,
        floorSqm,
        description,
        leaseCommenceDate,
        isViewable,
        postalCode
      })
    })
    .catch((err) => {
      console.log('Error: ', err)
    })
})

// Confirmation Page for hdb properties
router.get('/confirmPublicResaleListing/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePublicListingId, (req, res) => {
  // Get UUID from URL
  const resalePublicID = req.params.id
  console.log(req.params.id)

  hdbResale.update({
    // Make this property visible to users from agent
    isViewable: true
  }, {
    where: {
      id: resalePublicID
    }
  })
    .then(() => {
      res.send('/property/confirmPublicResaleListing/' + resalePublicID)
    }).catch((err) => { console.log('Error: ', err) })
})

// Basic Delete Function
// Delete hdb resale listing
router.get('/deletePublicResaleListing/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePublicListingId, (req, res) => {
  // Get UUID from URL
  const resalePublicID = req.params.id

  hdbResale.destroy({
    where: { id: resalePublicID }
  }).then(() => {
    // Redirect to preview resale list page for private properties
    res.redirect('/property/viewPreviewPublicList')
  }).catch((err) => { console.log('Error: ', err) })
})

// Display create resale listing page
router.get('/createPrivateResaleListing', checkAgentAuthenticated, (req, res) => {
  const title = 'Create Private Resale Listing'
  res.render('resale/createPrivateResale', { title })
})

// Create listing for private resale property
router.post('/createPrivateResaleListing', checkAgentAuthenticated, (req, res) => {
  // Create UUID
  const privateResaleId = uuid.v4()

  // Inputs
  const address = req.body.address1
  const description = 'Sample Description'
  const postalDistrict = req.body.postalDistrict
  const houseType = req.body.houseType
  const typeOfArea = req.body.typeOfArea
  const marketSegment = req.body.marketSegment
  const floorSqm = req.body.floorSqm
  const floorLevel = req.body.floorLevel

  // Call floor range selector to select floor range from floor level accordingly
  const floorRange = floorRangeSelector(req.body.floorLevel)

  // Date related inputs
  const leaseStartDate = new Date(req.body.leaseCommenceDate)
  const leaseStartYear = leaseStartDate.getFullYear()
  const dateOfSale = new Date(req.body.dateOfSale)

  // Call predicting api for private resale housing
  const resaleValue = predictPrivateResale(houseType, postalDistrict, marketSegment, typeOfArea, floorRange, dateOfSale, floorSqm, 1, 0, leaseStartDate)
  resaleValue.then((response) => {
  // Create private resale listing
    privateResale.create({
      id: privateResaleId,
      address,
      description,
      resalePrice: response,
      houseType,
      typeOfArea,
      marketSegment,
      postalDistrict,
      floorSqm,
      floorLevel,
      leaseCommenceDate: leaseStartDate,
      resaleDate: dateOfSale,
      isViewable: false
    }).then(() => {
      console.log('Created private resale listing')
      res.redirect('/property/confirmPrivateResaleListing/' + privateResaleId)
    }).catch((err) => { console.log('Error: ', err) })
  })
})

// View individual private Resale Page
router.get('/viewPrivateResaleListing/:id', (req, res) => {
  const title = 'Private Resale Listing'
  const secondaryTitle = '304 Blaster Up'
  // Get UUID from URL
  const privateResaleId = req.params.id

  privateResale.findOne({
    where: { id: privateResaleId }
  }).then((result) => {
    // Display result from database
    const id = result.id
    const address = result.address
    const description = result.description
    const resalePrice = result.resalePrice
    const houseType = result.houseType
    const typeOfArea = result.typeOfArea
    const marketSegment = result.marketSegment
    const postalDistrict = result.postalDistrict
    const floorSqm = result.floorSqm
    const floorLevel = result.floorLevel
    const leaseCommenceDate = result.leaseCommenceDate
    const resaleDate = result.resaleDate
    res.render('resale/viewPrivateResaleListing', {
      id,
      title,
      secondaryTitle,
      address,
      resalePrice,
      houseType,
      typeOfArea,
      marketSegment,
      postalDistrict,
      floorSqm,
      floorLevel,
      description,
      leaseCommenceDate,
      resaleDate
    })
  }).catch((err) => console.log('Error: ', err))
})

// Private Properties that are currently viewable to customers can be found here
router.get('/viewPrivateResaleList', (req, res) => {
  const title = 'Private Resale Listings'
  const isViewable = true
  privateResale.findAll({
    // Only users can see viewable properties
    where: {
      isViewable: isViewable
    },
    raw: true
  }).then((privateResale) => {
    res.render('resale/viewPrivateResaleList', { title, privateResale: privateResale })
  })
})

// Unviewable property listings that customers cannot see
router.get('/viewPreviewPrivateResaleList', checkAgentAuthenticated, (req, res) => {
  const title = 'Preview Private Resale Listings'
  privateResale.findAll({
    // Only agents can see all properties
    raw: true
  }).then((privateResale) => {
    res.render('resale/viewPrivateResaleList', { title, privateResale: privateResale })
  })
})

// Edit Function for private resale listings
router.get('/editPrivateResaleListing/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePrivateListingId, (req, res) => {
  const title = 'Edit Private Resale Listing'

  // Get UUID from URL
  const privateResaleId = req.params.id

  privateResale.findOne({
    where: { id: privateResaleId }
  }).then((result) => {
    // Display result from database
    const id = result.id
    const address = result.address
    const description = result.description
    const resalePrice = result.resalePrice
    const houseType = result.houseType
    const typeOfArea = result.typeOfArea
    const marketSegment = result.marketSegment
    const postalDistrict = result.postalDistrict
    const floorSqm = result.floorSqm
    const floorLevel = result.floorLevel
    const leaseCommenceDate = result.leaseCommenceDate
    const resaleDate = result.resaleDate
    res.render('resale/editPrivateResale', {
      id,
      title,
      address,
      resalePrice,
      houseType,
      typeOfArea,
      marketSegment,
      postalDistrict,
      floorSqm,
      floorLevel,
      leaseCommenceDate,
      resaleDate
    })
  }).catch((err) => console.log('Error: ', err))
})

// Update private property information to database
router.put('/editPrivateResaleListings/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePrivateListingId, (req, res) => {
  // Get UUID from URL
  const resalePrivateID = req.params.id

  // Inputs
  const address = req.body.address1
  const description = 'Sample Description'
  const postalDistrict = req.body.postalDistrict
  const houseType = req.body.houseType
  const typeOfArea = req.body.typeOfArea
  const marketSegment = req.body.marketSegment
  const floorSqm = req.body.floorSqm
  const floorLevel = req.body.floorLevel

  // Call floor range selector to select floor range from floor level accordingly
  const floorRange = floorRangeSelector(req.body.floorLevel)

  // Date related inputs
  const leaseStartDate = new Date(req.body.leaseCommenceDate)
  const leaseStartYear = leaseStartDate.getFullYear()
  const dateOfSale = new Date(req.body.dateOfSale)

  // Update private property listings
  privateResale.update({
    address,
    description,
    postalDistrict,
    houseType,
    typeOfArea,
    marketSegment,
    floorSqm,
    floorLevel,
    leaseCommenceDate: leaseStartDate,
    resaleDate: dateOfSale
  }, {
    where: { id: resalePrivateID }
  }).then(() => {
    console.log('Successfully edited private resale listing')
    res.redirect('/property/confirmPrivateResaleListing/' + resalePrivateID)
  })
})

// Confirmation Page for private properties
router.get('/confirmPrivateResaleListing/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePrivateListingId, (req, res) => {
  const title = 'Confirm Resale Listing - Private'

  // Probably need to modify this secondary title
  const secondaryTitle = '304 Blaster Up'

  // Get UUID from URL
  const privateResaleId = req.params.id

  privateResale.findOne({
    where: { id: privateResaleId }
  }).then((result) => {
    // Display result from database
    const id = result.id
    const address = result.address
    const description = result.description
    const resalePrice = result.resalePrice
    const houseType = result.houseType
    const typeOfArea = result.typeOfArea
    const marketSegment = result.marketSegment
    const postalDistrict = result.postalDistrict
    const floorSqm = result.floorSqm
    const floorLevel = result.floorLevel
    const leaseCommenceDate = result.leaseCommenceDate
    const resaleDate = result.resaleDate
    res.render('resale/confirmPrivateListing', {
      id,
      title,
      secondaryTitle,
      address,
      resalePrice,
      houseType,
      typeOfArea,
      marketSegment,
      postalDistrict,
      floorSqm,
      floorLevel,
      description,
      leaseCommenceDate,
      resaleDate
    })
  }).catch((err) => console.log('Error: ', err))
})

// Confirmation Page for private properties
router.get('/confirmPrivateResaleListing/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePublicListingId, (req, res) => {
  // Get UUID from URL
  const privateResaleId = req.params.id

  privateResale.update({
    // Make this property visible to users from agent
    isViewable: true
  }, {
    where: {
      id: privateResaleId
    }
  })
    .then(() => {
      res.redirect('/property/confirmPrivateResaleListing/' + privateResaleId)
    }).catch((err) => { console.log('Error: ', err) })
})

// Basic Delete Function
// Delete private resale listing
router.get('/deletePrivateResaleListing/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePrivateListingId, (req, res) => {
  const privateResaleId = req.params.id
  privateResale.destroy({
    where: { id: privateResaleId }
  }).then(() => {
    console.log('Deleted private property resale listing')
    // Redirect to preview resale list page for private properties
    res.redirect('/property/viewPreviewPrivateResaleList')
  }).catch((err) => { console.log('Error: ', err) })
})

module.exports = router
