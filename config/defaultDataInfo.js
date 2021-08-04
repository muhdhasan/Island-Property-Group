// This file main purpose is to autocreate default users so we don't need to add them manually everytime we restart the server.
const user = require('../models/User')
const hdbResale = require('../models/hdbResale')
const uuid = require('uuid')
const bcrypt = require('bcrypt')
const saltRounds = 10

// Salt User password with bcrypt so its unreadable in database
function saltPassword (password) {
  const hash = bcrypt.hashSync(password, saltRounds)
  return hash
}

// Admin User Schema
const AdminUserSchema = {
  id: uuid.NIL,
  name: 'Admin',
  email: 'admin@islandgroup.co',
  password: saltPassword('password'),
  isAgent: false,
  isAdmin: true,
  phoneNo: '12345678'
}

// Agent User Schema
const AgentUserSchema = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Agent',
  email: 'agent@islandgroup.co',
  password: saltPassword('password'),
  isAgent: true,
  isAdmin: false,
  phoneNo: '12345678'
}

// Agent User Schema
const NormalUserSchema = {
  id: '00000000-0000-0000-0000-000000000002',
  name: 'Customer',
  email: 'customer@islandgroup.co',
  password: saltPassword('password'),
  isAgent: false,
  isAdmin: false,
  phoneNo: '12345678'
}

// defaultUserList = [AdminUserSchema, AgentUserSchema]

const DefaultUsersObjects = () => {
  return new Promise((res) => {
    user.findOne({
      where: {
        id: '00000000-0000-0000-0000-000000000000'
      }
    })
      .then((result) => {
        // if admin user cannot be found
        if (result === null || result === undefined) {
          // Create admin, agent and normal accounts
          user.create(AdminUserSchema
          )
          user.create(AgentUserSchema
          )
          user.create(NormalUserSchema
          )
          console.log('Adding admin, agent and customer user')
          return res(1)
        } else { // if user is found
          console.log('Admin user exists')
          return res(0)
        }
      }).catch((err) => { console.log('Error in auto-creating users:', err) })
  })
}

// HDB Listing One Schema
const HDBResaleListingOne = {
  id: '00000000-0000-0000-0000-000000000000',
  address: 'Singapore Avenue 1',
  blockNo: 'Block 123',
  description: 'A typical HDB flat located in Singapore.',
  resalePrice: 500000,
  predictedValue: 600000,
  town: 'JURONG EAST',
  flatType: '5-ROOM',
  flatModel: 'NEW GENERATION',
  flatLevel: 45,
  floorSqm: 120,
  leaseCommenceDate: new Date('2000-01-01'),
  resaleDate: new Date('2021-07-08'),
  postalCode: '580123',
  isViewable: false,
  usePrediction: true
}

// HDB Listing Two Schema
const HDBResaleListingTwo = {
  id: '00000000-0000-0000-0000-000000000001',
  address: 'Singapore Avenue 5',
  blockNo: 'Block 456',
  description: 'Another typical HDB flat located in Singapore.',
  resalePrice: 600000,
  predictedValue: 600000,
  town: 'SENGKANG',
  flatType: '5-ROOM',
  flatModel: 'NEW GENERATION',
  flatLevel: 45,
  floorSqm: 120,
  leaseCommenceDate: new Date('2000-01-01'),
  resaleDate: new Date('2021-07-08'),
  postalCode: '580123',
  isViewable: true,
  usePrediction: true
}

// Create default HDB properties
const DefaultHDBPropertiesObjects = () => {
  return new Promise((res) => {
    hdbResale.findOne({
      where: {
        id: '00000000-0000-0000-0000-000000000000'
      }
    })
      .then((result) => {
        // if hdb listing one cannot be found
        if (result === null || result === undefined) {
          // Create hdb listings
          hdbResale.create(HDBResaleListingOne
          )
          hdbResale.create(HDBResaleListingTwo
          )
          console.log('Adding HDB Listings')
          return res(1)
        } else { // if user is found
          console.log('Basic HDB listings exists')
          return res(0)
        }
      }).catch((err) => { console.log('Error in auto-creating HDB Listings:', err) })
  })
}

// Create default Private properties
const DefaultPrivatePropertiesObjects = () => {

}

// check function
check = async () => {
  const score = await DefaultUsersObjects() + await DefaultHDBPropertiesObjects()

  if (score !== 0) {
    throw Error('Initial users (Admin) is missing in the database.\nWe will be creating initial users right now.\nWe will also create inital listings for HDB and private properties.')
  }
}

module.exports = { check }
