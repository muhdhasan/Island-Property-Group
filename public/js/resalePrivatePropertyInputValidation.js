'strict'

// For use in CRUD Property resale pages
const specialChar = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/
const form = document.getElementById('privatePropertyForm')
const addressOneInput = document.getElementById('address1')
const addressTwoInput = document.getElementById('address2')
const leaseStartYear = document.getElementById('leaseCommenceDate')
const resaleDate = document.getElementById('dateOfSale')

form.addEventListener('submit', (e) => {
  const errorMsg = []

  // Check if address fields has special characters
  if (specialChar.test(addressOneInput.value) === true) {
    document.getElementById('addressOneErrorMsg').innerHTML = 'Address field should not contain special characters'
    document.getElementById('addressOneErrorMsg').style.color = 'Red'
    document.getElementById('address1').style.outline = '1px solid Red'
    errorMsg.push('Address field should not contain special characters')
  }

  if (specialChar.test(addressTwoInput.value) === true) {
    document.getElementById('addressTwoErrorMsg').innerHTML = 'Address field should not contain special characters'
    document.getElementById('addressTwoErrorMsg').style.color = 'Red'
    document.getElementById('address2').style.outline = '1px solid Red'
    errorMsg.push('Address field should not contain special characters')
  }

  // Convert input to date objects
  const resaleDateObject = new Date(resaleDate.value)
  const leastStartYearObject = new Date(leaseStartYear.value)
  const totalMilisecondsPerDay = 1000 * 60 * 60 * 24

  // Get year difference
  const yearDiff = ((resaleDateObject - leastStartYearObject) / totalMilisecondsPerDay) / 365
  console.log((new Date(resaleDate.value) - new Date(leaseStartYear.value)) / 1000 / 60 / 60 / 24 / 365)

  // If isFreehold is false
  // Check year difference
  // If property is freehold, then dont need to validate whether there is lease commence date or not
  if (document.getElementById('isFreeholdNo').checked) {
    // Convert input to date objects
    const resaleDateObject = new Date(resaleDate.value)
    const leastStartYearObject = new Date(leaseStartYear.value)
    const totalMilisecondsPerDay = 1000 * 60 * 60 * 24

    // Get year difference
    const yearDiff = ((resaleDateObject - leastStartYearObject) / totalMilisecondsPerDay) / 365
    console.log((new Date(resaleDate.value) - new Date(leaseStartYear.value)) / 1000 / 60 / 60 / 24 / 365)

    // Property can only be sold after 5 years after lease Start Year
    if (yearDiff < 5) {
      document.getElementById('resaleDateErrorMsg').innerHTML = 'Ensure that resale date is at least 5 years from lease date'
      document.getElementById('resaleDateErrorMsg').style.color = 'Red'
      document.getElementById('dateOfSale').style.outline = '1px solid Red'
      errorMsg.push('Ensure that resale date is at least 5 years from lease date')
    }
  }

  // If error message list is more than 0
  // Prevent submission of form
  if (errorMsg.length > 0) {
    e.preventDefault()
  }
})
