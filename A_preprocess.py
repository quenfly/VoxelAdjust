import csv
#from flask.cli import F
import numpy as np
import open3d as o3d
from tqdm import tqdm


def interpolate_color(value, low, high, color1, color2):
    """Interpolate between two colors."""
    ratio = (value - low) / (high - low)
    r = int(color1[0] + ratio * (color2[0] - color1[0]))
    g = int(color1[1] + ratio * (color2[1] - color1[1]))
    b = int(color1[2] + ratio * (color2[2] - color1[2]))
    return r, g, b

def intensity_to_rgb(intensity):
    """Map normalized intensity to an RGB color based on the gradient."""
    if intensity <= 0.333:
        return interpolate_color(intensity, 0.0, 0.333, (0, 0, 255), (0, 255, 0))  # Blue -> Green
    elif intensity <= 0.666:
        return interpolate_color(
            intensity, 0.333, 0.666, (0, 255, 0), (255, 255, 0)
        )  # Green -> Yellow
    else:
        return interpolate_color(intensity, 0.666, 1.0, (255, 255, 0), (255, 0, 0))  # Yellow -> Red


# Main function to process the CSV file, voxelize, and save to PLY
def process_csv_to_ply(csv_filename, ply_filename, log_norm=True, pcd_transform=True):
    points = []
    intensities = []

    # Read the CSV file
    with open(csv_filename, "r") as csvfile:
        csvreader = csv.reader(csvfile)
        for row in csvreader:
            try:
                x, y, z, intensity = map(float, row)
            except ValueError:
                continue
            points.append((x, y, z))
            intensities.append(intensity)

    points = np.array(points)

    # Deal with values equaling 0
    intensities = np.array(intensities) + 1e-10

    # Apply log_transformed (optional)
    if log_norm:
        intensities = np.log(intensities)
    # Normalize intensity values to the range [0, 1] (optional)
        min_intensity = min(intensities)
        max_intensity = max(intensities)
        intensities = (
            ((np.array(intensities) - min_intensity) / (max_intensity - min_intensity))
            .reshape(-1, 1)
            .repeat(3, axis=1)
        )
    else:
        # If not normalizing, reshape to RGB format anyway
        intensities = (
            np.array(intensities)
            .reshape(-1, 1)
            .repeat(3, axis=1)
        )
    
    if pcd_transform is True:
        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(points)
        pcd.colors = o3d.utility.Vector3dVector(intensities)
        o3d.io.write_point_cloud(
            ply_filename, pcd.voxel_down_sample(voxel_size=0.006), write_ascii=False
        )
        print(f"{ply_filename} finished!")
    else:
        # Write to CSV file if pcd_transform is False
        # Extract intensity values (take the first channel since they're duplicated in RGB format)
        intensity_values = intensities[:, 0]
        
        # Create output CSV filename by inserting '_processed' before the extension
        csv_output_filename = ply_filename.replace('.ply', '.csv')
        
        # Write points and intensities to CSV
        with open(csv_output_filename, "w", newline="") as csvfile:
            csvwriter = csv.writer(csvfile)
            for i in range(len(points)):
                x, y, z = points[i]
                intensity = intensity_values[i]
                csvwriter.writerow([x, y, z, intensity])
        
        print(f"{csv_output_filename} finished!")



# Example usage:
'''
process_csv_to_ply("data/csv-Muiwo-1.csv", "data/csv-Muiwo-1.ply")
process_csv_to_ply("data/02_ground.csv", "data/02_ground.ply")
process_csv_to_ply("data/03_ground.csv", "data/03_ground.ply")

process_csv_to_ply("E:\\OneDrive - The University of Hong Kong - Connect\\sci_research\\2025.GPRAR_heritage\\sensitivity\\GPRdata\\Muiwo_4_7.csv",
                   "E:\\OneDrive - The University of Hong Kong - Connect\\sci_research\\2025.GPRAR_heritage\\sensitivity\\GPRdata\\Muiwo_4_7.ply", apply_log=False, normalize=False)
'''

process_csv_to_ply("pcd_postprocessing/pcd_data/csv-Muiwo-4.csv",
                   "pcd_postprocessing/pcd_data/csv-Muiwo-4_log_norm.ply", log_norm=True)


