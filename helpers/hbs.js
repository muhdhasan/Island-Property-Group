const moment = require('moment')

// Export handlebar helpers
module.exports = {

  // Self explanatory but refer to dateformat at moment documentation at https://momentjs.com/
  formatDate: (date, targetFormat) => {
    return moment(date).format(targetFormat)
  },

  // Input data comes from database while dropDown refers to the dropdown value of that option
  // If input data matches one of the dropdown value, that dropdown value is autoselected
  // If data does not match, return empty string
  autoSelectDropDown: (inputData, dropDown) => {
    return inputData === dropDown ? 'selected' : ''
  },

  // Basically converts 1000 to 1k so its more eligible for users
  roundOffToThousand: (inputPrice) => {
    return Math.round(inputPrice / 1000)
  },

  // Basically converts 1000000 to 1m so its more eligible for users
  roundOffToMillion: (inputPrice) => {
    return Math.round(inputPrice / 1000000)
  },

  // Check if user is admin or agent
  // So that we can set the appropriate navbar links respectively
  checkSpecialUserType: (user) => {
    // Check is user value exists or not
    if (user !== null && user !== undefined) {
      // Check if user is admin
      if (user.isAdmin === true) {
        return true
      }
      // User is agent
      else if (user.isAgent === true) {
        return true
      }
      // Reject the rest
      else {
        return false
      }
    } else {
      return false
    }
  }
}
