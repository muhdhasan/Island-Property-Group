const express = require('express')
const router = express.Router()

// Required node modules
const fetch = require('node-fetch')
const NodeGeocoder = require('node-geocoder');
const HDBResale = require('../models/hdbResale')
const PrivateResale = require('../models/PrivateResale')
const PrivateRental = require('../models/PrivateRental');
const { Console } = require('console');

//geocoder options 
const options = {
  provider: 'openstreetmap'
};
 
const geocoder = NodeGeocoder(options);

// Base URL String
const baseAPIUrl = process.env.baseAPIUrl || 'http://localhost:8000/api/'

//Get longitude and latitude from geocoder api
async function getlocation (location) {
  var locationformat = location.split(" ").join("+")
  return new Promise((result, err) => {
    fetch("https://maps.googleapis.com/maps/api/geocode/json?address=" + locationformat + "&key=" + process.env.googleAPIkey, 
    { method: 'post'})
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

//function to get distance between 2 points
function haversine_distance(address1lat, address1long, address2lat, address2long) {
  var R = 6371.0710; // Radius of the Earth in km
  var rlat1 = address1lat * (Math.PI/180); // Convert degrees to radians
  var rlat2 = address2lat * (Math.PI/180); // Convert degrees to radians
  var difflat = rlat2-rlat1; // Radian difference (latitudes)
  var difflon = (address2long-address1long) * (Math.PI/180); // Radian difference (longitudes)

  var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
  return d;
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

// Call predict resale API
async function test (msg) {
  // router.get('/getResalePrediction', (req, res) => {
  const body = {
    userInput: 'hello'
  }
  return new Promise((result, err) => {
    fetch(baseAPIUrl + 'chatbot', {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then((json) => {
        // console.log(json)
        result(json)
      })
      .catch((err) => {
        console.log('Error:', err)
      })
  // })
  })
}

// Test api call here
router.get('/testRoute', (req, res) => {
  const predictedValue = test('hello')
  predictedValue.then((result) => {
    // var test = JSON.parse(result)
    console.log(result.result)
    res.send('hello')
  })
})

router.post('/getlistings',(req,res) =>{
  const distance = req.body.distance
  const location = req.body.location
  const type =req.body.type
  const displaylistings = []
  console.log(location)
  getlocation(location).then((geo)=>{
    geometry = geo.results
    console.log(geometry)
    locationlat = geometry[0].geometry.location.lat
    locationlong = geometry[0].geometry.location.long
  
  if (type == "HDB Resale"){
    const title = 'HDB Resale'
    const isViewable = true
    const isPublic = true
    HDBResale.findAll({
      // Only users can see viewable properties
      where: {
        isViewable: isViewable
      },
      raw: true
    }).then((listings) =>{
      for (listing in listings){
        listinglong = listing.long
        listinglat = listing.lat
        distancefromlisting = haversine_distance(listinglat,listinglong,locationlat,locationlong)
        if (distance >= distancefromlisting){
          Console.log(distance)
          displaylistings.push(listing)
        }
      }
    })
    res.render('resale/viewPublicResaleList', { title, hdbResale: displaylistings, isViewable, isPublic })
  }
  if (type == "Private Resale"){
    
    PrivateResale.findAll().then((listings) =>{
      for (listing in listings){
        listinglong = listing.long
        listinglat = listing.lat
        distancefromlisting = haversine_distance(listinglat,listinglong,locationlat,locationlong)
        if (distance >= distancefromlisting){
          displaylistings.push(listing)
        }
      }
    })
    res.render('resale/viewPrivateResaleList', { title, privateResale: privateResale })
  }
  if (type == "Private Rental"){
    PrivateRental.findAll({
      // Only users can see viewable properties
      where: {
        isViewable: isViewable
      },
      raw: true
    }).then((listings) =>{
      for (listing in listings){
        listinglong = listing.long
        listinglat = listing.lat
        distancefromlisting = haversine_distance(listinglat,listinglong,locationlat,locationlong)
        if (distance >= distancefromlisting){
          displaylistings.push(listing)
        }
      }
    })
    res.render('rental/base', { title, privateRental: privateRental })
  }
})
})

module.exports = router
