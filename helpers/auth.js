const ensureUserAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { // If user is authenticated
    console.log(req.user.confirmed)
    return next()
  }
  // If not authenticated, show alert message and redirect to ‘/’
  //alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true)
  res.redirect('/')
}

module.exports = ensureUserAuthenticated
