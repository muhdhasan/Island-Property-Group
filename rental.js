"use strict";

// Validating user inputs
var validateInput = (housingEstate, housingType, floorSizeSqm, flatType, pets, parking) => {
  if (typeof housingEstate === undefined || housingEstate.length <= 0 || housingEstate === null) {
    console.log("Undefined input for housing estate field.");
    return false;
  }
  else if(typeof housingType === undefined || housingType.length <= 0 || housingType === null){
    console.log("Undefined input for HDB type field.");
    return false;
  }
  else if(typeof floorSizeSqm === undefined || floorSizeSqm.length <= 0 || floorSizeSqm === null){
    console.log("Invalid HDB Floor Size");
    return false;
  }
  else if(typeof flatType === undefined || flatType.length <= 0 || flatType === null){
    console.log("Invalid Flat Type");
    return false;
  }
  else if(typeof pets === undefined || pets.length <= 0 || pets === null){
    console.log("Invalid Pets Type");
    return false;
  }
  else if(typeof parking === undefined || parking.length <= 0 || parking === null){
    console.log("Invalid Parking Type");
    return false;
  }
  else{
    console.log("All fields are valid.")
    return true;
  }
};

function prediceRentalPrice() {

  // Retrieving values from user input
  var housingEstate = document.getElementById("housingEstateSelect").value;
  var housingType = document.getElementById("housingTypeSelect").value;
  var floorSizeSqm = document.getElementById("floorArea").value;
  var flatType = document.getElementById("flatModel").value;
  var pets = document.getElementById("Pets").value;
  var parking = document.getElementById("parking").value;
  var leaseStart = document.getElementById("leaseDateStart").value;
  var resaleDate = 0;

  console.log(housingEstate)

  var validateInputResult = validateInput(housingEstate, housingType, floorSizeSqm, flatType, pets, parking);
  console.log("Valid Input: " + validateInputResult);


  var currentdate = new Date();
  console.log(currentdate);

  var leaseDate = document.getElementById("leaseDateStart").value;
  console.log("Lease Date: " + leaseDate);
  console.log(typeof leaseDate);
  var dateDiff = currentdate - leaseDate;
  console.log("Date Diff: " + dateDiff);

  // document
  //   .getElementById("submitBtn")
  //   .addEventListener("click", function (event) {
  //     event.preventDefault();
  //   });

  // Conditions
  if (validateInputResult === false) {
    document.getElementById("predictedHousePrice").innerHTML = "Error"
    console.log("Validation Failed");
    return;
  } else if (validateInputResult === undefined) {
    document.getElementById("predictedHousePrice").innerHTML = "Error"
    console.log("Validation Failed");
    return;
  } else {
      if (housingEstate == "Toa Payoh")
      {
        document.getElementById("predictedHousePrice").innerHTML = "Price for rental of a house in "+housingEstate+" is $2000 for 1 month"
        document.getElementById("predictedHousePrice1").innerHTML = "Price for rental of a house in "+housingEstate+" is $24000 for 12 month"
        document.getElementById("predictedHousePrice2").innerHTML = "The minimal rental days is 12 months"
    }
      else if (housingEstate == "Ang Mo Kio")
      {
        document.getElementById("predictedHousePrice").innerHTML = "Price for rental of a house in "+housingEstate+" is $2800 for 1 month"
        document.getElementById("predictedHousePrice1").innerHTML = "Price for rental of a house in "+housingEstate+" is $33600 for 12 month"
        document.getElementById("predictedHousePrice2").innerHTML = "The minimal rental days is 12 months"
    }
      else if (housingEstate == "Bishan")
      {
        document.getElementById("predictedHousePrice").innerHTML = "Price for rental of a house in "+housingEstate+" is $1200 for 1 month"
        document.getElementById("predictedHousePrice1").innerHTML = "Price for rental of a house in "+housingEstate+" is $14400 for 12 month"
        document.getElementById("predictedHousePrice2").innerHTML = "The minimal rental days is 12 months"
      }
      else if (housingEstate == "Pasir Ris")
      {
        document.getElementById("predictedHousePrice").innerHTML = "Price for rental of a house in "+housingEstate+" is $5500 for 1 month"
        document.getElementById("predictedHousePrice1").innerHTML = "Price for rental of a house in "+housingEstate+" is $66000 for 12 month"
        document.getElementById("predictedHousePrice2").innerHTML = "The minimal rental days is 12 months"
      }
      else if (housingEstate == "Sengkang")
      {
        document.getElementById("predictedHousePrice").innerHTML = "Price for rental of a house in "+housingEstate+" is $7000 for 1 month"
        document.getElementById("predictedHousePrice1").innerHTML = "Price for rental of a house in "+housingEstate+" is $84000 for 12 month"
        document.getElementById("predictedHousePrice2").innerHTML = "The minimal rental days is 12 months"
      }
      else{
          document.getElementById("predictedHousingPrice").innerHTML = "No suitable pricing detected"
      }
    
  }
  
}
var calculatePrice = (housingEstate, housingType, floorSizeSqm, flatType, pets , parking) => {

    var finalPrice = housingEstate * housingType * floorSizeSqm * flatType * 1000;
    finalPrice = finalPrice * 1.2;
    finalPrice = finalPrice * 1.5;
  
    return (document.getElementById("predictedHousePrice").innerHTML = `S$${finalPrice}`);
  }
