const Sequelize = require('sequelize')
const db = require('../config/DBConfig')
const sequelize = require('../config/DBConfig')

/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const User = db.define('user', {
  id: { type: Sequelize.STRING, primaryKey: true },
  name: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
  isAgent: { type: Sequelize.BOOLEAN },
  isAdmin: { type: Sequelize.BOOLEAN }
  // confirmed: { type: Sequelize.BOOLEAN },
  // isadmin: { type: Sequelize.BOOLEAN },
  // facebookId: { type: Sequelize.STRING },
  // facebookToken: { type: Sequelize.STRING },
  // PhoneNo: { type: Sequelize.STRING },
  // address: { type: Sequelize.STRING },
  // address1: { type: Sequelize.STRING },
  // city: { type: Sequelize.STRING },
  // country: { type: Sequelize.STRING },
  // postalCode: { type: Sequelize.STRING },
  // stripeID: { type: Sequelize.STRING }
})

module.exports = User
