const Sequelize = require('sequelize')
const db = require('../config/DBConfig')
const sequelize = require('../config/DBConfig')

const PrivateRental = db.define('privateRental', {
  id: { type: Sequelize.STRING, primaryKey: true },
  address: { type: Sequelize.STRING(500) },
  description: { type: Sequelize.STRING(2000) },
  monthlyRent: { type: Sequelize.DECIMAL(6, 2) },
  houseType: { type: Sequelize.STRING },
  numberOfBedroom: { type: Sequelize.INTEGER },
  postalDistrict: { type: Sequelize.STRING },
  floorSqm: { type: Sequelize.DECIMAL(10, 2) },
  leaseCommenceDate: { type: Sequelize.DATEONLY },
  isViewable: { type: Sequelize.BOOLEAN }
  // houseImageOne: { type: Sequelize.BLOB },
  // houseImageTwo: { type: Sequelize.BLOB },
  // houseImageThree: { type: Sequelize.BLOB },
  // postalCode: { type: Sequelize.STRING },
})

module.exports = PrivateRental
