from flask import Flask, jsonify, render_template
from pathlib import Path
import json

app = Flask(__name__)
DATA_PATH = Path(__file__).parent / "data" / "menu.json"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/menu")
def api_menu():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return jsonify(json.load(f))

if __name__ == "__main__":
    app.run(debug=True)
