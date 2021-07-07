const ensureUserAuthenticated = (req, res, next) => {
  res.redirect('#')
}

module.exports = ensureUserAuthenticated
