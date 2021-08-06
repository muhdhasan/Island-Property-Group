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

//  CURRENTLY SHIFTING CODE RELATED TO PRIVATE RESALE TO THIS FILE

// Display create resale listing page
router.get('/create', checkAgentAuthenticated, (req, res) => {
  const title = 'Create Private Resale Listing'
  res.render('resale/createPrivateResale', { title })
    .catch((err) => { console.log('Error in displaying create private resale page: ', err) })
})

module.exports = router
