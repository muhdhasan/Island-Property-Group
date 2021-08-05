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
const baseAPIUrl = process.env.baseAPIUrl || 'http://localhost:8000/api/'

const floorRangeSelector = require('../helpers/floorRangeSelector')

// Middlewares
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
      .then(res =>
        res.json()
      )
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

// TESTING
// function displayPriceDiff (perDiff) {
//   // If percentage diff is more than 2%
//   if (perDiff > 2) {
//     return "positive"
//   }
//   // If percentage diff is more than -2%
//   else if (perDiff < -2) {
//     return "negative"
//   }
//   else{
//     return "equal"
//   }
// }

// Router is placed according to CRUD order where you'll see create function then followed by retrieve and etc

// Reference
router.get('/propertysingle', (req, res) => {
  const title = 'Property Single'
  res.render('resale/property-single', { title })
})

router.get('/propertylist', (req, res) => {
  const title = 'List of Properties'
  res.render('resale/property-grid', { title })
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
  console.log('Use AI: ', useAIOption)

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

    // Replace fixed value of sample description
    const description = 'Sample Description'

    // If user wants to display prediction from AI
    if (Boolean(useAIOption) === true) {
      // Create public resale listing
      hdbResale
        .create({
          id: hdbResaleId,
          address,
          blockNo,
          description,
          resalePrice: Math.round(response),
          predictedValue: Math.round(response),
          town,
          flatType,
          flatModel,
          flatLevel,
          floorSqm,
          leaseCommenceDate: leaseStartDate,
          resaleDate: dateOfSale,
          postalCode,
          isViewable: false,
          usePrediction: useAIOption
        })
        .then(() => {
          console.log('Created HDB Resale Listing')
          // Redirect to confirming property page
          res.redirect('confirmPublicResaleListing/' + hdbResaleId)
        })
        .catch((err) => console.log('Error in creating HDB Resale Listing: ' + err))
    } else {
      // If we want to display entered resale value instead of predicted value
      const resaleValue = req.body.resaleValue
      hdbResale
        .create({
          id: hdbResaleId,
          address,
          blockNo,
          description,
          resalePrice: Math.round(resaleValue),
          predictedValue: Math.round(response),
          town,
          flatType,
          flatModel,
          flatLevel,
          floorSqm,
          leaseCommenceDate: leaseStartDate,
          resaleDate: dateOfSale,
          postalCode,
          isViewable: false,
          usePrediction: useAIOption
        })
        .then(() => {
          console.log('Created HDB Resale Listing')
          // Redirect to confirming property page
          res.redirect('confirmPublicResaleListing/' + hdbResaleId)
        })
        .catch((err) => console.log('Error in creating HDB Resale Listing: ' + err))
    }
  })
})

// View individual HDB Resale Page
router.get('/viewPublicResaleListing/:id', checkUUIDFormat, checkResalePublicListingId, (req, res) => {
  const title = 'HDB Resale Listing'

  // Refer to mysql workbench for all property id
  const resalePublicID = req.params.id
  hdbResale
    .findOne({
      where: {
        id: resalePublicID
        // isViewable: true
      }
    })
    // Will display more information regarding this property later
    .then((hdbResaleDetail) => {
      const id = hdbResaleDetail.id
      const resalePrice = Math.round(hdbResaleDetail.resalePrice)
      const predictedValue = Math.round(hdbResaleDetail.predictedValue)
      const address = hdbResaleDetail.address
      const blockNo = hdbResaleDetail.blockNo
      const town = hdbResaleDetail.town
      const flatType = hdbResaleDetail.flatType
      const floorSqm = hdbResaleDetail.floorSqm
      const description = hdbResaleDetail.description
      const leaseCommenceDate = hdbResaleDetail.leaseCommenceDate
      const usePrediction = hdbResaleDetail.usePrediction
      const postalCode = hdbResaleDetail.postalCode

      // Calculate percentage differences and
      // round off to 2 decimal places
      const percentagePriceDifference = (((resalePrice - predictedValue) / predictedValue) * 100).toFixed(2)

      res.render('resale/viewPublicResaleListing', {
        id,
        address,
        blockNo,
        title,
        resalePrice,
        predictedValue,
        percentagePriceDifference,
        town,
        flatType,
        floorSqm,
        description,
        leaseCommenceDate,
        usePrediction,
        postalCode
      })
    })
    .catch((err) => {
      console.log('Error', err)
    })
})

// HDB Properties that are currently viewable to customers can be found here
router.get('/viewPublicResaleList', (req, res) => {
  const title = 'HDB Resale'
  const isViewable = true
  const isPublic = true
  hdbResale.findAll({
    // Only users can see viewable properties
    where: {
      isViewable: isViewable
    },
    raw: true
  }).then((hdbResale) => {
    res.render('resale/viewPublicResaleList', { title, hdbResale: hdbResale, isViewable, isPublic })
  })
})

// Unviewable property listings that customers cannot see
router.get('/viewPreviewPublicList', checkAgentAuthenticated, (req, res) => {
  const title = 'HDB Preview Resale'
  const isPublic = false
  hdbResale.findAll({
    // Only agents can see all properties
    raw: true
  }).then((hdbResale) => {
    res.render('resale/viewPublicResaleList', { title, hdbResale: hdbResale, isPublic })
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
    const resalePrice = result.resalePrice
    const predictedValue = result.predictedValue
    const address = result.address
    const blockNo = result.blockNo
    const description = result.description
    const town = result.town
    const flatType = result.flatType
    const flatModel = result.flatModel
    const floorLevel = parseInt(result.flatLevel)
    const floorSqm = result.floorSqm
    const leaseCommenceDate = result.leaseCommenceDate
    const resaleDate = result.resaleDate
    const usePrediction = result.usePrediction
    const postalCode = result.postalCode
    // Render property values from database
    res.render('resale/editPublicResale', {
      id,
      title,
      resalePrice,
      predictedValue,
      address,
      blockNo,
      town,
      flatType,
      flatModel,
      floorLevel,
      floorSqm,
      leaseCommenceDate,
      resaleDate,
      usePrediction,
      postalCode
    })
  }).catch((err) => console.log('Error: ', err))
})

// Update public property information to database
router.put('/editPublicResaleListing/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePublicListingId, (req, res) => {
  // Get UUID from URL
  const resalePublicID = req.params.id

  const filterSpecialRegex = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/
  // Inputs
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

  // TODO TEST UPDATE FUNCTION

  // Call predicting api for public resale housing
  const resaleValue = predictPublicResale(dateOfSale, town, flatType, floorRange, floorSqm, flatModel, leaseStartYear)
  resaleValue.then((response) => {
    // If user wants to display prediction from AI
    if (useAIOption === true) {
      // Update hdb resale listing according to UUID
      hdbResale.update({
        address,
        blockNo,
        description,
        resalePrice: Math.round(response),
        predictedValue: Math.round(response),
        town,
        flatType,
        flatModel,
        flatLevel,
        floorSqm,
        leaseCommenceDate: leaseStartDate,
        resaleDate: dateOfSale,
        postalCode,
        usePrediction: useAIOption
      }, {
        where: { id: resalePublicID }
      }).then(() => {
        // Redirect to confirmation page
        res.redirect('/property/confirmPublicResaleListing/' + resalePublicID)
      }).catch((err) => { console.log('Error in updating HDB Resale Listing: ', err) })
    } else {
      // If we want to display entered resale value instead of predicted value
      const resaleValue = req.body.resaleValue
      // Update hdb resale listing according to UUID
      hdbResale.update({
        address,
        blockNo,
        description,
        resalePrice: Math.round(resaleValue),
        predictedValue: Math.round(response),
        town,
        flatType,
        flatModel,
        flatLevel,
        floorSqm,
        leaseCommenceDate: leaseStartDate,
        resaleDate: dateOfSale,
        postalCode,
        usePrediction: useAIOption
      }, {
        where: { id: resalePublicID }
      }).then(() => {
        // Redirect to confirmation page
        res.redirect('/property/confirmPublicResaleListing/' + resalePublicID)
      }).catch((err) => { console.log('Error in updating HDB Resale Listing: ', err) })
    }
  })
})

// Confirmation Page for HDB properties
router.get('/confirmPublicResaleListing/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePublicListingId, (req, res) => {
  const title = 'Confirm Resale Listing - Public'

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
      const predictedValue = Math.round(hdbResaleDetail.predictedValue)
      const address = hdbResaleDetail.address
      const blockNo = hdbResaleDetail.blockNo
      const town = hdbResaleDetail.town
      const flatType = hdbResaleDetail.flatType
      const floorSqm = hdbResaleDetail.floorSqm
      const description = hdbResaleDetail.description
      const leaseCommenceDate = hdbResaleDetail.leaseCommenceDate
      const isViewable = hdbResaleDetail.isViewable
      const usePrediction = hdbResaleDetail.usePrediction
      const postalCode = hdbResaleDetail.postalCode

      // Calculate percentage differences and
      // round off to 2 decimal places
      const percentagePriceDifference = (((resalePrice - predictedValue) / predictedValue) * 100).toFixed(2)

      res.render('resale/confirmPublicListing', {
        id,
        address,
        blockNo,
        title,
        resalePrice,
        predictedValue,
        percentagePriceDifference,
        town,
        flatType,
        floorSqm,
        description,
        leaseCommenceDate,
        isViewable,
        usePrediction,
        postalCode
      })
    })
    .catch((err) => {
      console.log('Error: ', err)
    })
})

// Make HDB Resale Listing Public to Customer
router.get('/showPublicResaleListing/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePublicListingId, (req, res) => {
  // Get UUID from URL
  const resalePublicID = req.params.id

  hdbResale.update({
    // Make this property visible to users from agent
    isViewable: true
  }, {
    where: {
      id: resalePublicID
    }
  })
    .then(() => {
      res.redirect('/property/confirmPublicResaleListing/' + resalePublicID)
    }).catch((err) => { console.log('Error in making HDB Resale Listing Public: ', err) })
})

// Make HDB Resale Listing Private
router.get('/hidePublicResaleListing/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePublicListingId, (req, res) => {
  // Get UUID from URL
  const resalePublicID = req.params.id

  hdbResale.update({
    // Make this property invisible to users from agent
    isViewable: false
  }, {
    where: {
      id: resalePublicID
    }
  })
    .then(() => {
      res.redirect('/property/confirmPublicResaleListing/' + resalePublicID)
    }).catch((err) => { console.log('Error in making HDB Resale Listing Private: ', err) })
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
  const useAIOption = req.body.usePrediction

  // Call floor range selector to select floor range from floor level accordingly
  const floorRange = floorRangeSelector(req.body.floorLevel)

  // Date related inputs
  const leaseStartDate = new Date(req.body.leaseCommenceDate)
  const leaseStartYear = leaseStartDate.getFullYear()
  const dateOfSale = new Date(req.body.dateOfSale)

  // Call predicting api for private resale housing
  const resaleValue = predictPrivateResale(houseType, postalDistrict, marketSegment, typeOfArea, floorRange, dateOfSale, floorSqm, 1, 0, leaseStartDate)
  resaleValue.then((response) => {
    // If user wants to display prediction from AI
    if (Boolean(useAIOption) === true) {
      // Create private resale listing
      privateResale.create({
        id: privateResaleId,
        address,
        propertyName,
        description,
        resalePrice: Math.round(response),
        predictedValue: Math.round(response),
        houseType,
        typeOfArea,
        marketSegment,
        postalDistrict,
        floorSqm,
        floorLevel,
        leaseCommenceDate: leaseStartDate,
        resaleDate: dateOfSale,
        postalCode,
        isViewable: false,
        usePrediction: useAIOption
      }).then(() => {
        console.log('Created private resale listing')
        res.redirect('/property/confirmPrivateResaleListing/' + privateResaleId)
      }).catch((err) => { console.log('Error in creating private resale listing: ', err) })
    }
    // If we want to display entered resale value instead of predicted value
    else {
      // Create private resale listing
      const resaleValue = req.body.resaleValue
      privateResale.create({
        id: privateResaleId,
        address,
        description,
        resalePrice: Math.round(resaleValue),
        predictedValue: Math.round(response),
        houseType,
        typeOfArea,
        marketSegment,
        postalDistrict,
        floorSqm,
        floorLevel,
        leaseCommenceDate: leaseStartDate,
        resaleDate: dateOfSale,
        postalCode,
        isViewable: false,
        usePrediction: useAIOption
      }).then(() => {
        console.log('Created private resale listing')
        res.redirect('/property/confirmPrivateResaleListing/' + privateResaleId)
      }).catch((err) => { console.log('Error in creating private resale listing: ', err) })
    }
  })
})

// View individual private Resale Page
router.get('/viewPrivateResaleListing/:id', checkUUIDFormat, checkResalePrivateListingId, (req, res) => {
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
    const resalePrice = Math.round(result.resalePrice)
    const predictedValue = Math.round(result.predictedValue)
    const houseType = result.houseType
    const typeOfArea = result.typeOfArea
    const marketSegment = result.marketSegment
    const postalDistrict = result.postalDistrict
    const floorSqm = result.floorSqm
    const floorLevel = result.floorLevel
    const leaseCommenceDate = result.leaseCommenceDate
    // const resaleDate = result.resaleDate

    const usePrediction = result.usePrediction
    const postalCode = result.postalCode

    // Calculate percentage differences and
    // round off to 2 decimal places
    const percentagePriceDifference = (((resalePrice - predictedValue) / predictedValue) * 100).toFixed(2)

    res.render('resale/viewPrivateResaleListing', {
      id,
      title,
      secondaryTitle,
      address,
      resalePrice,
      predictedValue,
      percentagePriceDifference,
      houseType,
      typeOfArea,
      marketSegment,
      postalDistrict,
      floorSqm,
      floorLevel,
      description,
      leaseCommenceDate,
      usePrediction,
      postalCode
    })
  }).catch((err) => console.log('Error: ', err))
})

// Private Properties that are currently viewable to customers can be found here
router.get('/viewPrivateResaleList', (req, res) => {
  const title = 'Private Resale'
  const isViewable = true
  const isPublic = true
  privateResale.findAll({
    // Only users can see viewable properties
    where: {
      isViewable: isViewable
    },
    raw: true
  }).then((privateResale) => {
    res.render('resale/viewPrivateResaleList', { title, privateResale: privateResale, isPublic })
  })
})

// Unviewable property listings that customers cannot see
router.get('/viewPreviewPrivateResaleList', checkAgentAuthenticated, (req, res) => {
  const title = 'Private Preview Resale'
  const isPublic = false
  privateResale.findAll({
    // Only agents can see all properties
    raw: true
  }).then((privateResale) => {
    res.render('resale/viewPrivateResaleList', { title, privateResale: privateResale, isPublic })
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
    const propertyName = result.propertyName
    const description = result.description
    const resalePrice = result.resalePrice
    const predictedValue = result.predictedValue
    const houseType = result.houseType
    const typeOfArea = result.typeOfArea
    const marketSegment = result.marketSegment
    const postalDistrict = result.postalDistrict
    const floorSqm = result.floorSqm
    const floorLevel = result.floorLevel
    const leaseCommenceDate = result.leaseCommenceDate
    const resaleDate = result.resaleDate

    const usePrediction = result.usePrediction
    const postalCode = result.postalCode
    res.render('resale/editPrivateResale', {
      id,
      title,
      address,
      propertyName,
      resalePrice,
      houseType,
      typeOfArea,
      marketSegment,
      postalDistrict,
      floorSqm,
      floorLevel,
      leaseCommenceDate,
      resaleDate,
      usePrediction,
      postalCode
    })
  }).catch((err) => console.log('Error: ', err))
})

// Update private property information to database
router.put('/editPrivateResaleListings/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePrivateListingId, (req, res) => {
  // Get UUID from URL
  const resalePrivateID = req.params.id

  // Inputs
  const address = req.body.address
  const description = 'Sample Description'
  const postalCode = req.body.postalCode
  const postalDistrict = req.body.postalDistrict
  const houseType = req.body.houseType
  const typeOfArea = req.body.typeOfArea
  const marketSegment = req.body.marketSegment
  const floorSqm = req.body.floorSqm
  const floorLevel = req.body.floorLevel
  const useAIOption = req.body.usePrediction

  // Call floor range selector to select floor range from floor level accordingly
  const floorRange = floorRangeSelector(req.body.floorLevel)

  // Date related inputs
  const leaseStartDate = new Date(req.body.leaseCommenceDate)
  const leaseStartYear = leaseStartDate.getFullYear()
  const dateOfSale = new Date(req.body.dateOfSale)

  const resaleValue = predictPrivateResale(houseType, postalDistrict, marketSegment, typeOfArea, floorRange, dateOfSale, floorSqm, 1, 0, leaseStartDate)
  resaleValue.then((response)=> {
    if (Boolean(useAIOption) === true) {
      // Update private property listings
      privateResale.update({
        address,
        description,
        resalePrice: Math.round(response),
        predictedValue: Math.round(response),
        postalDistrict,
        houseType,
        typeOfArea,
        marketSegment,
        floorSqm,
        floorLevel,
        leaseCommenceDate: leaseStartDate,
        resaleDate: dateOfSale,
        postalCode,
        usePrediction: useAIOption
      }, {
        where: { id: resalePrivateID }
      }).then(() => {
        console.log('Successfully edited private resale listing')
        res.redirect('/property/confirmPrivateResaleListing/' + resalePrivateID)
      })
    } else {
      const resaleValue = req.body.resaleValue
      // Update private property listings
      privateResale.update({
        address,
        description,
        resalePrice: Math.round(resaleValue),
        predictedValue: Math.round(response),
        postalDistrict,
        houseType,
        typeOfArea,
        marketSegment,
        floorSqm,
        floorLevel,
        leaseCommenceDate: leaseStartDate,
        resaleDate: dateOfSale,
        postalCode,
        usePrediction: useAIOption
      }, {
        where: { id: resalePrivateID }
      }).then(() => {
        console.log('Successfully edited private resale listing')
        res.redirect('/property/confirmPrivateResaleListing/' + resalePrivateID)
      })
    }
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
    const resalePrice = Math.round(result.resalePrice)
    const predictedValue = Math.round(result.predictedValue)
    const houseType = result.houseType
    const typeOfArea = result.typeOfArea
    const marketSegment = result.marketSegment
    const postalDistrict = result.postalDistrict
    const floorSqm = result.floorSqm
    const floorLevel = result.floorLevel
    const leaseCommenceDate = result.leaseCommenceDate
    // const resaleDate = result.resaleDate

    const usePrediction = result.usePrediction
    const postalCode = result.postalCode

    // Calculate percentage differences and
    // round off to 2 decimal places
    const percentagePriceDifference = (((resalePrice - predictedValue) / predictedValue) * 100).toFixed(2)

    res.render('resale/confirmPrivateListing', {
      id,
      title,
      secondaryTitle,
      address,
      resalePrice,
      predictedValue,
      percentagePriceDifference,
      houseType,
      typeOfArea,
      marketSegment,
      postalDistrict,
      floorSqm,
      floorLevel,
      description,
      leaseCommenceDate,
      usePrediction,
      postalCode
    })
  }).catch((err) => console.log('Error: ', err))
})

// Make private resale listing public
router.get('/showPrivateResaleListing/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePrivateListingId, (req, res) => {
  // Get UUID from URL
  const privateResaleId = req.params.id
  console.log(privateResaleId)

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
    }).catch((err) => { console.log('Error in making Private Resale Listing Public: ', err) })
})

// Make private resale listing private
router.get('/hidePrivateResaleListing/:id', checkAgentAuthenticated, checkUUIDFormat, checkResalePrivateListingId, (req, res) => {
  // Get UUID from URL
  const privateResaleId = req.params.id
  console.log(privateResaleId)
  privateResale.update({
    // Make this property visible to users from agent
    isViewable: false
  }, {
    where: {
      id: privateResaleId
    }
  })
    .then(() => {
      res.redirect('/property/confirmPrivateResaleListing/' + privateResaleId)
    }).catch((err) => { console.log('Error in making Private Resale Listing Public: ', err) })
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
