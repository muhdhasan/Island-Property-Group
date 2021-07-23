const Sequelize = require('sequelize')
const db = require('../config/DBConfig')
const sequelize = require('../config/DBConfig')

const User = db.define('chatlog', {
  messageid: {type: Sequelize.STRING,primaryKey: true},
  message: { type: Sequelize.STRING },
  chatorder: { type: Sequelize.INTEGER },
  userid : {type:Sequelize.STRING},
  listingid : {type:Sequelize.STRING},
  isBot : {type:Sequelize.BOOLEAN}
})

module.exports = User