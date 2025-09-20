import random
import pandas as pd
import cv2
from ultralytics import YOLO

class Vehicle:
    def __init__(self, vid, road, pos=0):
        self.vid = vid
        self.road = road
        self.pos = pos

    def move(self, speed=1):
        self.pos += speed
        if self.pos > 100:
            self.pos = 0

class TrafficSimulator:
    def __init__(self):
        self.roads = ['A', 'B', 'C', 'D']
        self.vehicles = [Vehicle(i, random.choice(self.roads)) for i in range(20)]
        # Load historical traffic dataset
        try:
            self.traffic_data = pd.read_csv('datasets/traffic_data.csv')
        except:
            self.traffic_data = None
        # Load YOLOv8 model for vehicle detection
        self.model = YOLO('models/yolov8n.pt')

    def update_positions(self):
        # Example: speed based on historical congestion
        for v in self.vehicles:
            speed = 1
            if self.traffic_data is not None:
                # Reduce speed if road congested in historical data
                congestion = self.traffic_data[self.traffic_data['road'] == v.road]['congestion'].mean()
                if congestion > 70: speed = 0.5
            v.move(speed)

    def detect_vehicles_from_video(self, video_path='videos/traffic.mp4'):
        cap = cv2.VideoCapture(video_path)
        ret, frame = cap.read()
        vehicle_count = 0
        if ret:
            results = self.model(frame)
            for r in results:
                vehicle_count += len([x for x in r.boxes if x.cls in [2,3,5,7]]) # car, bus, truck
        cap.release()
        return vehicle_count

    def get_vehicle_positions(self):
        return [{"id": v.vid, "road": v.road, "pos": v.pos} for v in self.vehicles]
