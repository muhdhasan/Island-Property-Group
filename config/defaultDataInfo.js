const sequelize = require('sequelize')
const db = require('../config/DBConfig')
const user = require('../models/User')
const uuid = require('uuid')

// Admin User Schema
const AdminUserSchema = {
  id: uuid.NIL,
  name: 'Admin',
  email: 'admin@islandgroup.co',
  password: 'password',
  isAgent: false,
  isAdmin: true,
  phoneNo: '12345678'
}

const AdminUserObject = () => {
  return new Promise((res) => {
    user.findOne({
      where: {
        id: '00000000-0000-0000-0000-000000000000'
      }
    })
      .then((result) => {
        // if user cannot be found
        if (result === null || result === undefined) {
          user.create(AdminUserSchema
          )
          console.log('Adding admin user')
          return res(1)
        } else { // if user is found
          console.log('Admin user exists')
          return res(0)
        }
      })
  })
}

// check function
check = async () => {
  const score = await AdminUserObject()

  if (score !== 0) {
    throw Error('Admin User Object is missing in the database.\nWe will be creating admin user right now.')
  }
}

module.exports = { check }
