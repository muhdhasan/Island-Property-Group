"use strict";

// Validating user inputs
var validateInput = (housingEstate, housingType, floorSizeSqm, flatType, leaseStart, resaleDate) => {
  if (typeof housingEstate === undefined || housingEstate.length <= 0 || housingEstate === null) {
    console.log("Undefined input for housing estate field.");
    document.getElementById("housingEstateErrorMsg").innerHTML = "Please choose your housing estate";
    document.getElementById("housingEstateErrorMsg").classList.add("invalid-feedback");
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
  else if(typeof leaseStart === undefined || leaseStart.length <= 0 || leaseStart === null){
    console.log("Invalid Lease Date");
    return false;
  }
  else if(typeof resaleDate === undefined || resaleDate.length <= 0 || resaleDate === null){
    console.log("Invalid Resale Date");
    return false;
  }
  // else if(dateDiff <= 0){
  //   console.log("Lease date cannot start after resale date");
  //   document.getElementById("leaseErrorMsg").innerHTML = "Lease date cannot be after resale date";
  //   document.getElementById("leaseErrorMsg").classList.add("invalid-feedback");
  //   return false;
  // }
  else{
    console.log("All fields are valid.")
    return true;
  }
};

function predictHousePrice() {

  // Retrieving values from user input
  var housingEstate = document.getElementById("housingEstateSelect").value;
  var housingType = document.getElementById("housingTypeSelect").value;
  var floorSizeSqm = document.getElementById("floorArea").value;
  var flatType = document.getElementById("flatModel").value;
  var resaleDateInput = document.getElementById("resaleDate").value;
  var leaseDateInput = document.getElementById("leaseDateStart").value;

  var currentdate = new Date();
  console.log(currentdate);

  var leaseDate = new Date(leaseDateInput);
  console.log("Lease Date: " + leaseDate);
  var resaleDate = new Date(resaleDateInput);
  console.log("Resale Date: " + leaseDate);
  var dateDiff = resaleDate - leaseDate;
  console.log("Date Diff: " + dateDiff);

  var validateInputResult = validateInput(housingEstate, housingType, floorSizeSqm, flatType, leaseDateInput, resaleDateInput);
  
  // Logging input result
  console.log("Valid Input: " + validateInputResult);

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
  }
  else if(dateDiff <= 0){
    console.log("Lease date cannot start after resale date");
    // document.getElementById("leaseErrorMsg").innerHTML = "Lease date cannot be after resale date";
    return;
  } else {
    calculatePrice(housingEstate, housingType, floorSizeSqm, flatType);
  }
}

// Price calculation
// Might actually add a machine learning model here
var calculatePrice = (housingEstate, housingType, floorSizeSqm, flatType) => {

  var finalPrice = housingEstate * housingType * floorSizeSqm * flatType * 1000;

  return (document.getElementById("predictedHousePrice").innerHTML = `S$${finalPrice}`);
}
