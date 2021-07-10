const Sequelize = require('sequelize')
const db = require('../config/DBConfig')
const sequelize = require('../config/DBConfig')

const PrivateResale = db.define('privateResale', {
  id: { type: Sequelize.STRING, primaryKey: true },
  address: { type: Sequelize.STRING(500) },
  description: { type: Sequelize.STRING(2000) },
  resalePrice: { type: Sequelize.DECIMAL(12, 2) },
  houseType: { type: Sequelize.STRING },
  postalDistrict: { type: Sequelize.STRING },
  floorSqm: { type: Sequelize.DECIMAL(10, 2) },
  leaseCommenceDate: { type: Sequelize.DATEONLY },
  resaleDate: { type: Sequelize.DATEONLY }
  // houseImageOne: { type: Sequelize.BLOB },
  // houseImageTwo: { type: Sequelize.BLOB },
  // houseImageThree: { type: Sequelize.BLOB },
  // postalCode: { type: Sequelize.STRING },
})

module.exports = PrivateResale
