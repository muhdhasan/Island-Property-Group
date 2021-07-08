from flask import Flask, json
from flask import request
from flask import jsonify
from sklearn.preprocessing import OneHotEncoder
from flask_cors import CORS

import traceback
import pickle
import torch 
import numpy as np
from transformers import AlbertTokenizerFast
import pandas as pd
import datetime as dt

# Start Flask Server
app = Flask(__name__)

# Expose api in the 'api' route and allow connection to localhost 8080
CORS(app, resources=r'/api/*', origin=["https://localhost:8080", "https://localhost:5000"])

class APIAuthError(Exception):
  code = 403
  description = "Authentication Error"

#intent classification tokenizer, model load and function
tokenizer = AlbertTokenizerFast.from_pretrained('albert-base-v2',do_lower_case=True) 
intent_model = torch.load("../training/intentclassification.model")
def infer_intent(text):
    input = tokenizer(text, truncation=True, padding=True, return_tensors="pt").to("cuda")
    output = intent_model(**input, return_dict=True)
    output = output.logits[0].to("cpu").detach().numpy()
    label_index = np.argmax(output)
    del input
    del output
    torch.cuda.empty_cache()
    return label_index

# Call this function if you want to convert datetime to ordinal type
# Prob gonna simply this code in this function cos abit too long
def convertToOrdinal(df):
    df['month'] = pd.to_datetime(df['month'],format='%Y-%m', errors='coerce')
    # Convert month to ordinal type so we can use the data for training our model
    df['month'] = df['month'].map(dt.datetime.toordinal)

    df['lease_commence_date'] = pd.to_datetime(df['lease_commence_date'],format='%Y', errors='coerce')
    # Convert month to ordinal type so we can use the data for training our model
    df['lease_commence_date'] = df['lease_commence_date'].map(dt.datetime.toordinal)


# 'Catch all error handling'
@app.errorhandler(500)
def handle_exception(err):
    """Return JSON instead of HTML for any other server error"""
    app.logger.exception(f"Unknown Exception: {str(err)}")
    app.logger.debug(''.join(traceback.format_exception(etype=type(err), value=err, tb=err.__traceback__)))
    response = {"Status Code": "500",
                "Reason": "It seems there is an error on our servers. Contact our support if this error persists."}
    return jsonify(response), 500

# Handle unknown URLs
@app.errorhandler(404)
def page_not_found(err):
    app.logger.exception(f"Unknown URL: {str(err)}")
    app.logger.debug(''.join(traceback.format_exception(etype=type(err), value=err, tb=err.__traceback__)))
    response = {"Status Code": "404",
                "Reason": "This page doesn't exist. Try another URL to see if it works."}
    return jsonify(response), 404

# Test route
@app.route("/api/test", methods=["POST"])
def test():
    # Get json response
    input = request.get_json()

    if not input["a"] or not input["b"]:
        raise APIAuthError("Please ensure that you have all the correct parameters.")
    else:
        # Read keys of json
        result = input["a"] + input["b"]

        # Return in json format
        return jsonify({"Results" : result}) , 200

# Predict public & private resale price route
@app.route("/api/predictResale", methods=["POST"])
def predictHouseResale():

    # Get json response
    input = request.get_json()

    # Conditions to predict public or private housing
    if input["type"] == "public":
        # Categorical columns List
        categorical_cols = ['town', 'flat_type', 'storey_range', 'flat_model']

        # Load encoder
        with open('training/publicResaleEncoder.pickle', 'rb') as f:
            ohe = pickle.load(f)

        # Read JSON response
        resaleDate = input["resale_date"]
        town = input["town"]
        flatType = input["flat_type"]
        storeyRange = input["storey_range"]
        floorAreaSqm = input["floor_area_sqm"]
        flatModel = input["flat_model"]
        leaseCommenceDate = input["lease_commence_date"]
        data = [[resaleDate, town, flatType, storeyRange, floorAreaSqm, flatModel, leaseCommenceDate]]

        # Convert json data into dataframe format
        newDf = pd.DataFrame(data, columns=['month','town','flat_type','storey_range','floor_area_sqm','flat_model','lease_commence_date'])

        convertToOrdinal(newDf)

        # Apply one hot encoding on newdf for prediction
        cat_ohe_new = ohe.transform(newDf[categorical_cols])
        #Create a Pandas DataFrame of the hot encoded column
        ohe_df_new = pd.DataFrame(cat_ohe_new, columns = ohe.get_feature_names(input_features = categorical_cols))
        #concat with original data and drop original columns
        df_ohe_new = pd.concat([newDf, ohe_df_new],join='inner', axis=1).drop(columns = categorical_cols, axis=1)

        # Convert into numpy cos XGBoost hates pandas
        df_ohe_new = df_ohe_new.values

        # Load model
        resalePublicModel = pickle.load(open('training/xgb_public_resale.pickle', 'rb'))

        # Predict Model
        predictionResult = resalePublicModel.predict(df_ohe_new)

        return str(predictionResult)
    elif input["type"] == "private":
        # Categorical columns List
        categorical_cols = ['Type', 'Postal District', 'Type of Area', 'Floor Level']

        # Read JSON response
        resaleDate = input["resale_date"]
        floorAreaSqm = input["floor_area_sqm"]
        leaseCommenceDate = input["lease_commence_date"]
        postalDistrict = input["postal_district"]

        # convertToOrdinal(newDf)
        
        # Load Model
        # resalePrivateModel = pickle.load(open('xgb_private_resale.pickle', 'rb'))

        # Predict Model
        # predictionResult = resalePrivateModel.predict()
        predictionResult = "Nothing"
        return str(predictionResult)
    else:
        # raise APIAuthError("Please ensure that you have all the correct parameters.")
        # return jsonify({"Results" : "Error"}) , 200
        return "testing"

# Predict rental prices route
@app.route("/api/predictRental", methods=["POST"])
def predictHouseRent():
    #getting input from website
    input = request.get_json()

    # Categorical columns List
    categorical_cols = ['town', 'flat_type', 'storey_range', 'flat_model']

    RentalModel = pickle.load(open('rental.pickle', 'rb'))
    return "Rental Result"

# Chatbot route
@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    text = request.get_json()
    sentence_labels = ["goodbye",
                   "greeting",
                   "house_age",
                   "house_area",
                   "description",
                   "price",
                   "sale_period",
                   "sale_reason",
                   "viewing"]
    return sentence_labels[infer_intent(text)]
    
# Start at localhost:8000
if __name__ == '__main__':
    app.run(host="localhost", port=8000, debug=False)
