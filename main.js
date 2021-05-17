"use strict";
function prediceHousePrice() {
  var housingEstate = document.getElementById("housingEstateSelect").value;

  console.log(housingEstate);
  document.getElementById("predictedHousePrice").innerHTML = "Testing";
  var currentdate = new Date();
  console.log(currentdate);

  var leaseDate = document.getElementById("leaseDateStart").value;
  console.log("Lease Date: " + leaseDate);
  console.log(typeof leaseDate);
  var dateDiff = currentdate - leaseDate;
  console.log("Date Diff: " + dateDiff);

  //if(){}
  //else if
  //else
  document
    .getElementById("submitBtn")
    .addEventListener("click", function (event) {
      event.preventDefault();
    });

  return (document.getElementById("predictedHousePrice").innerHTML = "Testing");
}
