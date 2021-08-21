const express = require('express')
const router = express.Router()

// Required node modules
const fetch = require('node-fetch')
const NodeGeocoder = require('node-geocoder')
const HDBResale = require('../models/hdbResale')
const PrivateResale = require('../models/PrivateResale')
const PrivateRental = require('../models/PrivateRental')

// geocoder options
const options = {
  provider: 'openstreetmap'
}

const geocoder = NodeGeocoder(options)

// Base URL String
const baseAPIUrl = process.env.baseAPIUrl || 'http://localhost:8000/api/'

// Get longitude and latitude from geocoder api
async function getlocation (location) {
  const locationformat = location.split(' ').join('+')
  return new Promise((result, err) => {
    fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + locationformat + '&key=' + process.env.googleAPIkey,
      { method: 'post' })
      .then(res => res.json()
      )
      .then((json) => {
        result(json)
      })
      .catch((err) => {
        console.log('Error:', err)
      })
  })
}

// function to get distance between 2 points
function haversine_distance (address1lat, address1long, address2lat, address2long) {
  const R = 6371.0710 // Radius of the Earth in km
  const rlat1 = address1lat * (Math.PI / 180) // Convert degrees to radians
  const rlat2 = address2lat * (Math.PI / 180) // Convert degrees to radians
  const difflat = rlat2 - rlat1 // Radian difference (latitudes)
  const difflon = (address2long - address1long) * (Math.PI / 180) // Radian difference (longitudes)

  const d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)))
  return d
}

router.get('/', (req, res) => {
  const title = 'Home'
  const activeNavOne = 'active'
  res.render('index', { title, activeNavOne })
})

router.get('/about', (req, res) => {
  const title = 'About Us'
  const activeNavTwo = 'active'
  res.render('about', { title, activeNavTwo })
})

router.get('/contact', (req, res) => {
  const title = 'Contact Us'
  const activeNavContact = 'active'
  res.render('contact', { title, activeNavContact })
})

router.post('/getlistings', (req, res) => {
  const distance = req.body.distance
  const location = req.body.location
  const type = req.body.type
  const displaylistings = []
  console.log(location)
  getlocation(location).then((geo) => {
    const geometry = geo.results
    console.log(geometry)
    const locationlat = geometry[0].geometry.location.lat
    const locationlong = geometry[0].geometry.location.long

    if (type === 'HDB Resale') {
      const title = 'HDB Resale'
      const isViewable = true
      const isPublic = true
      HDBResale.findAll({
      // Only users can see viewable properties
        where: {
          isViewable: isViewable
        },
        raw: true
      }).then((listings) => {
        for (listing in listings) {
          const listinglong = listing.long
          const listinglat = listing.lat
          const distancefromlisting = haversine_distance(listinglat, listinglong, locationlat, locationlong)
          if (distance >= distancefromlisting) {
            Console.log(distance)
            displaylistings.push(listing)
          }
        }
      })
      res.render('resale/viewPublicResaleList', { title, hdbResale: displaylistings, isViewable, isPublic })
    }
    if (type === 'Private Resale') {
      PrivateResale.findAll().then((listings) => {
        for (listing in listings) {
          const listinglong = listing.long
          const listinglat = listing.lat
          const distancefromlisting = haversine_distance(listinglat, listinglong, locationlat, locationlong)
          if (distance >= distancefromlisting) {
            displaylistings.push(listing)
          }
        }
      })
      res.render('resale/viewPrivateResaleList', { title, privateResale: privateResale })
    }
    if (type === 'Private Rental') {
      PrivateRental.findAll({
      // Only users can see viewable properties
        where: {
          isViewable: isViewable
        },
        raw: true
      }).then((listings) => {
        for (listing in listings) {
          const listinglong = listing.long
          const listinglat = listing.lat
          const distancefromlisting = haversine_distance(listinglat, listinglong, locationlat, locationlong)
          if (distance >= distancefromlisting) {
            displaylistings.push(listing)
          }
        }
      })
      res.render('rental/base', { title, privateRental: privateRental })
    }
  })
})

module.exports = router
