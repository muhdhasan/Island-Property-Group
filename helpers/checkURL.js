// Consolidate check regex for uuid
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Check if uuid in urls are in the right format
// So cannot really run sql injection if user is redirected to user page
const checkUUIDFormat = (req, res, next) => {
  const UUIDInput = req.params.id
  // Redirect to homepage if uuid is invalid
  if (uuidRegex.test(UUIDInput) === false) {
    res.redirect('/')
  }
  // Otherwise just continue to next statement
  else{
      return next()
  }
}

module.exports = checkUUIDFormat
