const Sequelize = require('sequelize')
const db = require('../config/DBConfig')
const sequelize = require('../config/DBConfig')

const HDBResale = db.define('hdb_resale', {
  id: { type: Sequelize.STRING, primaryKey: true },
  address: { type: Sequelize.STRING(500) },
  description: { type: Sequelize.STRING(2000) },
  resalePrice: { type: Sequelize.DECIMAL(12, 2) },
  town: { type: Sequelize.STRING },
  flatType: { type: Sequelize.STRING },
  flatModel: { type: Sequelize.STRING },
  flatLevel: { type: Sequelize.STRING },
  floorSqm: { type: Sequelize.DECIMAL(10, 2) },
  leaseCommenceDate: { type: Sequelize.DATEONLY },
  resaleDate: { type: Sequelize.DATEONLY }
  // houseImage: { type: Sequelize.BLOB }
  // postalCode: { type: Sequelize.STRING },
})

module.exports = HDBResale
