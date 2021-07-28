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

// Check if user is admin
const checkAgentAuthenticated = (req, res, next) => {
  // Check if agent is authenticated first
  if (req.isAuthenticated()) {
    // If user is agent then continue to next statement
    if (req.user.isAgent === true) {
      next()
    } else {
      return res.redirect('/')
    }
  }
  // Redirect to home apge
  else {
    return res.redirect('/')
  }
}

module.exports = { ensureUserAuthenticated, checkNotAuthenticated, checkAgentAuthenticated }
