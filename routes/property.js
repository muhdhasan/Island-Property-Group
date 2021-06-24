const express = require('express')
const router = express.Router()

router.get('/propertysingle', (req, res) => {
  const title = 'Property Single'
  res.render('property/property-single', { title: title })
})

router.get('/propertylist', (req, res) => {
  const title = 'List of Properties'
  res.render('property/property-grid', { title: title })
})

// router.get('/createPropertyResaleListing', (req, res) => {
//   const title = 'List of Properties'
//   res.render('property/property-grid', { title: title })
// })

// router.post('/createProperty', (req, res) => {
//   res.redirect('')
// })

module.exports = router
