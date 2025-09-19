import numpy as np

def simulate_traffic(df):
    """
    Returns current traffic for all lanes.
    For prototype, we randomly fluctuate historical values.
    """
    lanes = ['lane1', 'lane2', 'lane3']
    current = {}
    for lane in lanes:
        base = np.random.choice(df[lane].values)
        fluct = np.random.randint(-5, 6)
        current[lane] = max(0, int(base + fluct))
    return current
