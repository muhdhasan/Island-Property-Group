'strict'

function isFreeholdCheck () {
  if (document.getElementById('isFreeholdYes').checked) {
    document.getElementById('leaseCommenceDate').disabled = true
    document.getElementById('leaseCommenceDate').value = ""
  } else {
    document.getElementById('leaseCommenceDate').disabled = false
  }
}
