from flask import Flask, json
from flask import request
from flask import jsonify

app = Flask(__name__)

@app.route("/test", methods=["POST"])
def test():
    input = request.get_json()

    result = input["a"] + input["b"]

    return jsonify({"Results" : result})

if __name__ == '__main__':
    app.run(debug=False)
