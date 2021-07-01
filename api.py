from flask import Flask, json
from flask import request
from flask import jsonify

import traceback
import pickle
import torch 
import numpy as np
from transformers import AlbertTokenizerFast
# import pandas as pd
app = Flask(__name__)

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
        resalePublicModel = pickle.load(open('xgb_public_resale.pickle', 'rb'))
        # resalePublicModel.predict()
        return "Resale Result"
    elif input["type"] == "private":
        resalePrivateModel = pickle.load(open('xgb_private_resale.pickle', 'rb'))
        # resalePrivateModel.predict()
        return "Resale Result"
    else:
        # raise APIAuthError("Please ensure that you have all the correct parameters.")
        return jsonify({"Results" : "Error"}) , 200

# Predict rental prices route
@app.route("/api/predictRental", methods=["POST"])
def predictHouseRent():
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
