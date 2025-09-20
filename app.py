from flask import Flask, render_template, jsonify
import pandas as pd
import random
import datetime

app = Flask(__name__)

# Load traffic dataset
traffic_data = pd.read_csv("static/traffic_data.csv")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/optimal-path")
def optimal_path():
    # Example logic: choose path with lowest score
    sample_paths = [
        {"path": "Route A → Route B → Route C", "score": random.randint(10, 40)},
        {"path": "Route A → Route D → Route E", "score": random.randint(20, 50)},
    ]
    best = min(sample_paths, key=lambda x: x["score"])
    return jsonify(best)

@app.route("/api/traffic-alerts")
def traffic_alerts():
    alerts = [
        {"type": "construction", "msg": "Main Street closed for work, expect 15 min delay"},
        {"type": "heavy", "msg": "Highway 101 Southbound is congested"},
        {"type": "greenwave", "msg": "Park Avenue synchronized at 25 km/h"},
        {"type": "clear", "msg": "Downtown road is clear now"},
    ]
    return jsonify(alerts)

@app.route("/api/historical-analysis")
def historical_analysis():
    # Group by month for seasonal traffic spikes
    traffic_data["date"] = pd.to_datetime(traffic_data["date"])
    monthly = traffic_data.groupby(traffic_data["date"].dt.month)["traffic_score"].mean().to_dict()
    return jsonify(monthly)

if __name__ == "__main__":
    app.run(debug=True)
