import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

# Load original dataset
file_path = "data/traffic_data.csv"  # update path if needed
df = pd.read_csv(file_path)

# -----------------------------
# Create synthetic new columns
# -----------------------------
# Random from/to pairs
print(df.columns)

