// Checks if user is authenticated
const ensureUserAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // Process to next statement if user is authenticated
    return next()
  }
  // If user is not authenticated
  // Return user to home page
  else {
    res.redirect('/')
  }
}

// Check if user is not authenticated
// If user is authenticated
// Redirect user to home page from certain pages such as login
const checkNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  } else {
    next()
  }
}

module.exports = { ensureUserAuthenticated, checkNotAuthenticated }
