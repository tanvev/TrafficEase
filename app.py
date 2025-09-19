from flask import Flask, render_template, jsonify
import pandas as pd
import random

app = Flask(__name__)

# Load traffic dataset
df = pd.read_csv('data/traffic_data.csv')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/traffic')
def traffic_api():
    """
    Returns latest traffic congestion data for lanes
    """
    # For simplicity, pick a random row to simulate "live" traffic
    row = df.sample(1).iloc[0]
    data = {
        'lane1': int(row['lane1']),
        'lane2': int(row['lane2']),
        'lane3': int(row['lane3']),
        'congestion_level': int((row['lane1']+row['lane2']+row['lane3'])/3),
        'avg_wait_time': int(random.uniform(30,90)),  # seconds
        'violations_today': int(random.uniform(50,200))
    }
    return jsonify(data)
@app.route('/api/driver')
def driver_api():
    """Driver portal data: lane congestion and alternate routes"""
    row = df.sample(1).iloc[0]
    data = {
        'lanes': {
            'lane1': int(row['lane1']),
            'lane2': int(row['lane2']),
            'lane3': int(row['lane3']),
        },
        'routes': [
            {'name':'Fastest Route','distance':8.2,'traffic':row['lane1'],'green_waves':3,'time':12},
            {'name':'Scenic Route','distance':9.1,'traffic':row['lane2'],'green_waves':1,'time':15},
            {'name':'Highway Route','distance':12.8,'traffic':row['lane3'],'green_waves':1,'time':18}
        ],
        'wait_time': random.randint(5,15),
        'alt_routes': 2
    }
    return jsonify(data)

@app.route('/api/emergency')
def emergency_api():
    """Emergency portal data: current active emergencies & green corridor"""
    active = random.choice([True, False])
    data = {
        'status': 'Active' if active else 'No Active Emergency',
        'vehicle':'Ambulance' if active else None,
        'route':'City Hospital' if active else None,
        'eta':random.randint(5,15) if active else None
    }
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
