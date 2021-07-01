from flask import Flask, json
from flask import request
from flask import jsonify

import traceback
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)

class APIAuthError(Exception):
  code = 403
  description = "Authentication Error"

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
        # resalePublicModel = pickle.load(open('xgb_public_resale.pickle', 'rb'))

        resaleDate = input["resale_date"]
        floorAreaSqm = input["floor_area_sqm"]
        leaseCommenceDate = input["lease_commence_date"]
        town = input["town"]
        flatType = input["flat_type"]
        flatModel = input["flat_model"]
        # resalePublicModel.predict()
        return "Resale Result"
    elif input["type"] == "private":
        # resalePrivateModel = pickle.load(open('xgb_private_resale.pickle', 'rb'))

        resaleDate = input["resale_date"]
        floorAreaSqm = input["floor_area_sqm"]
        leaseCommenceDate = input["lease_commence_date"]
        postalDistrict = input["postal_district"]
        # resalePrivateModel.predict()
        return "Resale Result"
    else:
        # raise APIAuthError("Please ensure that you have all the correct parameters.")
        # return jsonify({"Results" : "Error"}) , 200
        
        # resalePublicModel = pickle.load(open('xgb_public_resale.pickle', 'rb'))
        # df = pd.read_csv('dataset/sale-prediction/private-housing/AC1-5.csv')

        # X contains features
        # X = df.drop(['resale_price'], axis=1)

        # # y contains target to be predicted
        # y = df['resale_price']

        # model = pd.read_pickle('training/xgb_public_resale.pickle')
        # print(model.columns)
        # print(X)
        return "testing" #str(model.columns)

# Predict rental prices route
@app.route("/api/predictRental", methods=["POST"])
def predictHouseRent():
    return "Rental Result"

# Chatbot route
@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    return "Chatbot Response"

# Start at localhost:8000
if __name__ == '__main__':
    app.run(host="localhost", port=8000, debug=False)
