from flask import Flask, json
from flask import request
from flask import jsonify

import traceback

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
    response = {"Error Type": "500",
                "Reason": "It seems there is an error on our servers. Contact our support if this error persists."}
    return jsonify(response), 500

# Test route
@app.route("/test", methods=["POST"])
def test():
    # Get json response
    input = request.get_json()

    if not input["a"] or not input["b"]:
        raise APIAuthError("Please ensure that you have all the correct parameters.")
    else:
        # Read keys of json
        result = input["a"] + input["b"]

        # Return in json format
        return jsonify({"Results" : result})

# Predict public & private resale price route
@app.route("/predictResale", methods=["POST"])
def predictHouseResale():
    return "Resale Result"

# Predict rental prices route
@app.route("/predictRental", methods=["POST"])
def predictHouseRent():
    return "Rental Result"

# Chatbot route
@app.route("/chatbot", methods=["POST"])
def predictHouseResale():
    return "Chatbot Response"

if __name__ == '__main__':
    app.run(host="localhost", port=8000, debug=False)
