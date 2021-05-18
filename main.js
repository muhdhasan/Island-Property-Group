"use strict";

// Validating user inputs
var validateInput = (housingEstate, housingType, floorSizeSqm, flatType) => {
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
  else{
    console.log("All fields are valid.")
    return true;
  }
};

function prediceHousePrice() {

  // Retrieving values from user input
  var housingEstate = document.getElementById("housingEstateSelect").value;
  var housingType = document.getElementById("housingTypeSelect").value;
  var floorSizeSqm = document.getElementById("floorArea").value;
  var flatType = document.getElementById("flatModel").value;
  var leaseStart = document.getElementById("leaseDateStart").value;
  var resaleDate = document.getElementById("resaleDate").value;

  var validateInputResult = validateInput(housingEstate, housingType, floorSizeSqm, flatType);
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
    console.log("Validation Failed");
    return;
  } else if (validateInputResult === undefined) {
    console.log("Validation Failed");
    return;
  } else {
    return (document.getElementById("predictedHousePrice").innerHTML =
      "Testing");
  }
}
