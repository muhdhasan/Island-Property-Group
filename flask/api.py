from flask import Flask, json
from flask import request
from flask import jsonify
from flask.logging import create_logger
from sklearn.preprocessing import OneHotEncoder
from flask_cors import CORS

import traceback
import pickle
import torch 
import numpy as np
from transformers import AlbertTokenizerFast
import pandas as pd
from datetime import datetime

from transformers.utils.dummy_pt_objects import default_data_collator

# Start Flask Server
app = Flask(__name__)
log = create_logger(app)

# Expose api in the 'api' route and allow connection to localhost 8080
CORS(app, resources=r'/api/*', origin=["https://localhost:8080/", "https://localhost:5000/"])

class APIAuthError(Exception):
  code = 403
  description = "Authentication Error"

# Check if cuda is available
isCudaAvailable = torch.cuda.is_available()

# intent classification tokenizer, model load and function
tokenizer = AlbertTokenizerFast.from_pretrained('albert-base-v2',do_lower_case=True) 
def infer_intent(text, isCudaAvailable):
    if isCudaAvailable == True:
        intent_model = torch.load("./flask/intentclassification.model")
        input = tokenizer(text, truncation=True, padding=True, return_tensors="pt").to("cuda")
        output = intent_model(**input, return_dict=True)
        output = output.logits[0].to("cpu").detach().numpy()
        label_index = np.argmax(output)
        del input
        del output
        torch.cuda.empty_cache()
        return label_index
    else:
        intent_model = torch.load("./flask/intentclassification.model",map_location ='cpu')
        input = tokenizer(text, truncation=True, padding=True, return_tensors="pt")
        output = intent_model(**input, return_dict=True)
        output = output.logits[0].to("cpu").detach().numpy()
        label_index = np.argmax(output)
        del input
        del output
        torch.cuda.empty_cache()
        return label_index

# Call this function if you want to convert datetime to ordinal type
def convertToOrdinal(df, houseType):
    if houseType == "public":
        df['month'] = pd.to_datetime(df['month'],format='%Y-%m', errors='coerce')
        # Convert month to ordinal type so we can use the data for training our model
        df['month'] = df['month'].map(datetime.toordinal)

        df['lease_commence_date'] = pd.to_datetime(df['lease_commence_date'],format='%Y', errors='coerce')
        # Convert lease_commence_date to ordinal type so we can use the data for training our model
        df['lease_commence_date'] = df['lease_commence_date'].map(datetime.toordinal)
    else:
        df['Date of Sale'] = pd.to_datetime(df['Date of Sale'],format='%b-%Y', errors='coerce')
        # Convert Date of Sale to ordinal type so we can use the data for training our model
        df['Date of Sale'] = df['Date of Sale'].map(datetime.toordinal)
        
        df['Start Lease Date'] = pd.to_datetime(df['Start Lease Date'],format='%Y', errors='coerce')
        # Convert month to ordinal type so we can use the data for training our model
        df['Start Lease Date'] = df['Start Lease Date'].map(datetime.toordinal)

#Calling this function to convert datetime to number of days
def convertToDays(df):
    #gets the current datetime
    now = pd.to_datetime("now")

    # Convert month column to 'month' type
    df['Lease_Commencement_Date'] = pd.to_datetime(df['Lease_Commencement_Date'])
    df['Lease_Commencement_Date'] = (now - df['Lease_Commencement_Date']).dt.days

# 'Catch all error handling'
@app.errorhandler(500)
def handle_exception(err):
    """Return JSON instead of HTML for any other server error"""
    log.exception(f"Unknown Exception: {str(err)}")
    log.debug(''.join(traceback.format_exception(etype=type(err), value=err, tb=err.__traceback__)))
    response = {"Status Code": "500",
                "Reason": "It seems there is an error on our servers. Contact our support if this error persists."}
    return jsonify(response), 500

# Handle unknown URLs
@app.errorhandler(404)
def page_not_found(err):
    log.exception(f"Unknown URL: {str(err)}")
    log.debug(''.join(traceback.format_exception(etype=type(err), value=err, tb=err.__traceback__)))
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
        with open('flask/publicResaleEncoder.pickle', 'rb') as f:
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
        newDf = pd.DataFrame(data, columns=['month','town','flat_type',
        'storey_range','floor_area_sqm','flat_model','lease_commence_date'])

        convertToOrdinal(newDf, input["type"])

        # Apply one hot encoding on newdf for prediction
        cat_ohe_new = ohe.transform(newDf[categorical_cols])
        #Create a Pandas DataFrame of the hot encoded column
        ohe_df_new = pd.DataFrame(cat_ohe_new, columns = ohe.get_feature_names(input_features = categorical_cols))
        #concat with original data and drop original columns
        df_ohe_new = pd.concat([newDf, ohe_df_new],join='inner', axis=1).drop(columns = categorical_cols, axis=1)

        # Convert into numpy cos XGBoost hates pandas
        df_ohe_new = df_ohe_new.values

        # Load model
        resalePublicModel = pickle.load(open('flask/xgb_public_resale.pickle', 'rb'))

        # Predict Model
        predictionResult = resalePublicModel.predict(df_ohe_new)
        print(predictionResult)
        return str(predictionResult)
    elif input["type"] == "private":
        # Categorical columns List
        categorical_cols = ['Type', 'Postal District', 'Market Segment', 'Type of Area', 'Floor Level']

        # Load encoder
        with open('flask/privateResaleEncoder.pickle', 'rb') as f:
            ohe = pickle.load(f)
        
        # Read JSON response
        houseType = input["house_type"]
        postalDistrict = input["postal_district"]
        marketSegment = input["market_segment"]
        typeOfArea = input["type_of_area"]
        floorLevel = input["floor_level"]
        resaleDate = input["resale_date"]
        floorAreaSqm = input["floor_area_sqm"]
        isFreehold = input["is_freehold"]
        leaseDuration = input["lease_duration"]
        leaseCommenceDate = input["lease_commence_date"]
        data = [[houseType, postalDistrict, marketSegment, typeOfArea, floorLevel, resaleDate,
         floorAreaSqm, isFreehold, leaseDuration, leaseCommenceDate]]

        # Convert json data into dataframe format
        newDf = pd.DataFrame(data, columns=['Type','Postal District','Market Segment',
        'Type of Area','Floor Level','Date of Sale','Area Per Unit (sqm/unit)','Freehold',
        'Tenure Duration (Years)','Start Lease Date'])

        convertToOrdinal(newDf, input["type"])
        
        # Apply one hot encoding on newdf for prediction
        cat_ohe_new = ohe.transform(newDf[categorical_cols])
        #Create a Pandas DataFrame of the hot encoded column
        ohe_df_new = pd.DataFrame(cat_ohe_new, columns = ohe.get_feature_names(input_features = categorical_cols))
        #concat with original data and drop original columns
        df_ohe_new = pd.concat([newDf, ohe_df_new],join='inner', axis=1).drop(columns = categorical_cols, axis=1)

        # Convert into numpy cos XGBoost hates pandas
        df_ohe_new = df_ohe_new.values

        # Load Model
        resalePrivateModel = pickle.load(open('flask/xgb_private_resale.pickle', 'rb'))

        # Predict Model
        predictionResult = resalePrivateModel.predict(df_ohe_new)

        return str(predictionResult)
    else:
        # Raise Error if input does not specify to predict resale value of public or private houses
        raise APIAuthError("Please state what type of housing (public/private) do you want to predict.")

# Predict rental prices route
@app.route("/api/predictRental", methods=["POST"])
def predictHouseRent():
    #getting input from website
    input = request.get_json()

    # Categorical columns List
    categorical_cols = ['Postal_District','Type']

    # Load encoder
    with open('flask/RentalEncoder.pickle', 'rb') as f:
        ohe = pickle.load(f)

    # Read JSON response
    postal_district = input["Postal_District"]
    type = input["Type"]
    bedrooms = input["No_Bedroom"]
    floorAreaSqf = input["Floor_Area"]
    leaseCommenceDate = input["Lease_Commencement_Date"]
    data = [[postal_district, type, bedrooms, floorAreaSqf, leaseCommenceDate]]
    
    # Convert json data into dataframe format
    df = pd.DataFrame(data, columns=['Postal_District', 'Type', 'No_Bedroom', 'Floor_Area', 'Lease_Commencement_Date'])

    convertToDays(df)

    # Apply one hot encoding on newdf for prediction
    cat_ohe_new = ohe.transform(df[categorical_cols])
    #Create a Pandas DataFrame of the hot encoded column
    ohe_df_new = pd.DataFrame(cat_ohe_new, columns = ohe.get_feature_names(input_features = categorical_cols))
    #concat with original data and drop original columns
    df_ohe_new = pd.concat([df, ohe_df_new],join='inner', axis=1).drop(columns = categorical_cols, axis=1)
    print(df_ohe_new.info())

    RentalModel = pickle.load(open('flask/rental.pickle', 'rb'))
    
    predictionResult = RentalModel.predict(df_ohe_new)

    return str(predictionResult)
    

# Chatbot route
@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    text = request.get_json()
    sentence_labels = ["goodbye",
                   "greeting",
                   "lease_commencement",
                   "rent_cost",
                   "house_info",
                   "resale_price",
                   "resale_date",
                   'address',
                   "viewing"]
    # Get value from 'userInput' key
    userResponse = text["userInput"]
    result = sentence_labels[infer_intent(userResponse, isCudaAvailable)]
<<<<<<< HEAD:flask/api.py
    return jsonify({"result": result})
=======
    return jsonify({"result":result})
>>>>>>> chatbot:api.py
    
# Start at localhost:8000
if __name__ == '__main__':
    app.run(host="localhost", port=8000, debug=False)
