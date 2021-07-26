'strict'

function isFreeholdCheck () {
  if (document.getElementById('isFreeholdYes').checked) {
    document.getElementById('leaseCommenceDate').disabled = true
  } else {
    document.getElementById('leaseCommenceDate').disabled = false
  }
}
