const express = require('express')
const router = express.Router()

// Models
const privateRental = require('../models/PrivateRental')

// Required node modules
const uuid = require('uuid')
const moment = require('moment')
const fetch = require('node-fetch')

const baseAPIUrl = 'http://localhost:8000/api/'
const floorRangeSelector = require('../helpers/floorRangeSelector')

// Consolidate check regex for uuid
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

router.get('/base', (req, res) => {
    const title = 'Rental Properties'
    res.render('rental/base', { title: title })
  })

router.get('/createRental', (req, res) => {
    const title = 'Rental Properties'
    res.render('rental/createRental', { title: title })
  })

module.exports = router
