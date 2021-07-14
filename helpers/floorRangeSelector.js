// Pass floor level to this function
// And return floor range
// Use switch statement
const floorRangeSelector = (floorLevel) => {
  if (floorLevel === null || floorLevel === undefined) {
    return 'Error'
  } else if (floorLevel >= 1 <= 5) {
    return '01 TO 05'
  } else if (floorLevel >= 6 <= 10) {
    return '06 TO 10'
  } else if (floorLevel >= 11 <= 15) {
    return '11 TO 15'
  } else if (floorLevel >= 16 <= 20) {
    return '16 TO 20'
  } else if (floorLevel >= 21 <= 25) {
    return '21 TO 25'
  } else if (floorLevel >= 26 <= 30) {
    return '26 TO 30'
  } else if (floorLevel >= 31 <= 35) {
    return '31 TO 35'
  } else if (floorLevel >= 36 <= 40) {
    return '36 TO 40'
  } else if (floorLevel >= 41 <= 45) {
    return '41 TO 45'
  } else {
    return '46 TO 51'
  }
}

module.exports = floorRangeSelector
