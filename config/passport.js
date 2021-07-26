const LocalStrategy = require('passport-local').Strategy

// Encrypt password
const bcrypt = require('bcryptjs')

// Model
const User = require('../models/User')

function localStrategy (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      User.findOne({ where: { email: email } }).then((user) => {
        // If user is not found
        if (!user) {
          return done(null, false, { message: 'Invalid Email' })
        }
        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err
          // If password match
          if (isMatch) {
            return done(null, user)
          } else {
            return done(null, false, { message: 'Incorrect Passwoord' })
          }
        })
      })
    })
  )
  // Serializes (stores) user id into session upon successful
  // authentication
  passport.serializeUser((user, done) => {
    done(null, user.id) // user.id is used to identify authenticated user
  })
  // User object is retrieved by userId from session and
  // put into req.user
  passport.deserializeUser((userId, done) => {
    User.findByPk(userId)
      .then((user) => {
        console.log(user)
        done(null, user) // user object saved in req.session
      })
      .catch((done) => {
        console.log(done)
        // No user found, not stored in req.session
        console.log(done)
      })
  })
}

module.exports = { localStrategy }
