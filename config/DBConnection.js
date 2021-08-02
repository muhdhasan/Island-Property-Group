const mySQLDB = require('./DBConfig')
const user = require('../models/User')
const hdbResale = require('../models/hdbResale')
const privateResale = require('../models/PrivateResale')
const privateRental = require('../models/PrivateRental')

// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
  mySQLDB.authenticate()
    .then(() => {
      console.log('Real Estate Database Connected')
    })
    .then(() => {
      /*               Defines the relationship where a user has many videos.
              In this case the primary key from user will be a foreign key
              in video.             */

      // Map to what each agent is in charge of
      // user.hasMany(hdbResale)
      // user.hasMany(privateResale)
      // user.hasMany(privateRental)
      mySQLDB.sync({ // Creates table if none exists
        force: drop
      })
        .then(() => {
          console.log('Create tables if none exists')
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log('Error: ' + err))
}

module.exports = { setUpDB }
