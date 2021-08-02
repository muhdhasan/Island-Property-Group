// Consolidate check regex for uuid
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const hdbResale = require('../models/hdbResale')
const privateResale = require('../models/PrivateResale')

// Check if uuid in urls are in the right format
// So cannot really run sql injection if user is redirected to user page
const checkUUIDFormat = (req, res, next) => {
  const UUIDInput = req.params.id
  // Redirect to homepage if uuid is invalid
  if (uuidRegex.test(UUIDInput) === false) {
    res.redirect('/')
  }
  // Otherwise just continue to next statement
  else {
    return next()
  }
}

// Check if uuid of hdb resale property exist in database
// If it doesn't exist, redirect to home page without any explanation for security reasons
const checkResalePublicListingId = (req, res, next) => {
  const resalePublicID = req.params.id

  // Find one property based on that id
  hdbResale.findOne({
    where: { id: resalePublicID }
  })
    .then((result) => {
      if (result === null) {
        res.redirect('/')
      }
      // Otherwise just continue to next statement
      else {
        return next()
      }
    })
}

// Check if uuid of private resale property exist in database
// If it doesn't exist, redirect to home page without any explanation for security reasons
const checkResalePrivateListingId = (req, res, next) => {
  const resalePrivateID = req.params.id

  // Find one property based on that id
  privateResale.findOne({
    where: { id: resalePrivateID }
  })
    .then((result) => {
      if (result === null) {
        res.redirect('/')
      }
      // Otherwise just continue to next statement
      else {
        return next()
      }
    })
}

module.exports = { checkUUIDFormat, checkResalePublicListingId, checkResalePrivateListingId }
