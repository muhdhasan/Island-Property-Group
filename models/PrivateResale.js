const Sequelize = require('sequelize')
const db = require('../config/DBConfig')

const PrivateResale = db.define('privateResale', {
  id: { type: Sequelize.STRING, primaryKey: true },
  address: { type: Sequelize.STRING(500) },
  propertyName: { type: Sequelize.STRING },
  description: { type: Sequelize.STRING(2000) },
  resalePrice: { type: Sequelize.DECIMAL(12, 2) },
  predictedValue: { type: Sequelize.DECIMAL(12, 2) },
  houseType: { type: Sequelize.STRING },
  typeOfArea: { type: Sequelize.STRING },
  marketSegment: { type: Sequelize.STRING },
  postalDistrict: { type: Sequelize.STRING },
  floorSqm: { type: Sequelize.DECIMAL(10, 2) },
  floorLevel: { type: Sequelize.STRING },
  leaseCommenceDate: { type: Sequelize.DATEONLY },
  resaleDate: { type: Sequelize.DATEONLY },
  postalCode: { type: Sequelize.STRING },
  isViewable: { type: Sequelize.BOOLEAN },
  usePrediction: { type: Sequelize.BOOLEAN }
  // houseImageOne: { type: Sequelize.BLOB },
  // houseImageTwo: { type: Sequelize.BLOB },
  // houseImageThree: { type: Sequelize.BLOB },
})

module.exports = PrivateResale
