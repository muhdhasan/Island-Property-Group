'strict'

// For use in CRUD Property pages
const specialChar = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/
const form = document.getElementById('propertyForm')
const addressOneInput = document.getElementById('address1')
const addressTwoInput = document.getElementById('address2')

form.addEventListener('submit', (e) => {
  let errorMsg = []
  // Check if address field has special characters
  if (specialChar.test(addressOneInput.value) === true) {
    document.getElementById('addressOneErrorMsg').innerHTML = 'Address field should not contain special characters'
    document.getElementById('addressOneErrorMsg').style.color = "Red"
    errorMsg.push("Address field should not contain special characters")
  }

  if (specialChar.test(addressTwoInput.value) === true) {
    document.getElementById('addressTwoErrorMsg').innerHTML = 'Address field should not contain special characters'
    document.getElementById('addressTwoErrorMsg').style.color = "Red"
    errorMsg.push("Address field should not contain special characters")
  }

  // If error message list is more than 0
  // Prevent submission of form
  if (errorMsg.length > 0){
    e.preventDefault()
  }
})
