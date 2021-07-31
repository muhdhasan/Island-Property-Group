"strict";

function useAImodel() {
  // If button is checked // Disable manual input of resale value // Clear any input to resale value if user has entered anything
  if (document.getElementById("yesRadio").checked) {
    document.getElementById("resaleValue").disabled = true;
    document.getElementById("resaleValue").value = "";
    document.getElementById("resaleDiv").style.display = "none";
  } else {
    document.getElementById("resaleValue").disabled = false;
    document.getElementById("resaleDiv").style.display = "block";
  }
}
