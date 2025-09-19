def calculate_travel_time(distance_km, speed_kmh):
    """
    Simple travel time estimate in minutes
    """
    return round((distance_km / speed_kmh) * 60, 2)
