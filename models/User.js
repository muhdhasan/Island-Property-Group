const Sequelize = require('sequelize')
const db = require('../config/DBConfig')

/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const User = db.define('user', {
  id: { type: Sequelize.STRING, primaryKey: true },
  name: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
  isAgent: { type: Sequelize.BOOLEAN },
  isAdmin: { type: Sequelize.BOOLEAN },
  phoneNo: { type: Sequelize.STRING, allowNull: true }
})

module.exports = User
