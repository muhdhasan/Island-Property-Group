const Sequelize = require('sequelize')
const db = require('../config/DBConfig')

const HDBResale = db.define('hdb_resale', {
  id: { type: Sequelize.STRING, primaryKey: true },
  address: { type: Sequelize.STRING(500) },
  blockNo: { type: Sequelize.STRING },
  description: { type: Sequelize.STRING(2000) },
  resalePrice: { type: Sequelize.DECIMAL(12, 2) },
  predictedValue: { type: Sequelize.DECIMAL(12, 2) },
  town: { type: Sequelize.STRING },
  flatType: { type: Sequelize.STRING },
  flatModel: { type: Sequelize.STRING },
  flatLevel: { type: Sequelize.STRING },
  floorSqm: { type: Sequelize.DECIMAL(10, 2) },
  leaseCommenceDate: { type: Sequelize.DATEONLY },
  resaleDate: { type: Sequelize.DATEONLY },
  postalCode: { type: Sequelize.STRING },
  isViewable: { type: Sequelize.BOOLEAN }
  // houseImageOne: { type: Sequelize.BLOB },
  // houseImageTwo: { type: Sequelize.BLOB },
  // houseImageThree: { type: Sequelize.BLOB },
})

module.exports = HDBResale
