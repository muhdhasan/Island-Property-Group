// Pass floor level to this function
// And return floor range
// Use switch statement
const floorRangeSelector = (floorLevel) => {
    if (floorLevel === null || floorLevel === undefined){
      return "Error"
    }
    else if(1 <= floorLevel <= 5){
      return "01 TO 05"
    }
    else if(6 <= floorLevel <= 10){
      return "06 TO 10"
    }
    else if(11 <= floorLevel <= 15){
      return "11 TO 15"
    }
    else if(16 <= floorLevel <= 20){
      return "16 TO 20"
    }
    else if(21 <= floorLevel <= 25){
      return "21 TO 25"
    }
    else if(26 <= floorLevel <= 30){
      return "26 TO 30"
    }
    else if(31 <= floorLevel <= 35){
      return "31 TO 35"
    }
    else if(36 <= floorLevel <= 40){
      return "36 TO 40"
    }
    else if(41 <= floorLevel <= 45){
      return "41 TO 45"
    }
    else{
      return "46 TO 51"
    }
  }

module.exports = floorRangeSelector