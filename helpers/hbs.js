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

  // Automatically checks radio button should radio value and input value are similar
  autoCheckRadioBtn: (inputData, radioValue) => {
    if (inputData === radioValue) {
      return 'checked'
    } else {
      return ''
    }
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
  checkSpecialUserType: (user, requiredUserType) => {
    // Check is user value exists or not
    if (user !== null && user !== undefined) {
      // Check if user is admin
      if (user.isAdmin === true && requiredUserType === 'Admin') {
        return true
      }
      // User is agent
      else if (user.isAgent === true && requiredUserType === 'Agent') {
        return true
      }
      // Reject the rest
      else {
        return false
      }
    } else {
      return false
    }
  },

  // This function checks if the listing uses resaleValue or predictedValue
  // If we want to display predictedValue, usePrediction has to be true
  // Otherwise, false
  displayPredictedValue: (resaleValue, predictedValue, usePrediction) => {
    if (usePrediction === true || usePrediction === 1) {
      return predictedValue
    } else {
      return resaleValue
    }
  }
}
