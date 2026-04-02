import sys
import geopandas as gpd

# Load the GeoJSON data for Venice 1740 Land Register
gdf = gpd.read_file("https://github.com/epfl-timemachine/venice-1740-landregister/blob/main/1740_Catastici_2025-09-24.geojson?raw=true")

# Keep only the 'uid' property
gdf = gdf[['uid', 'geometry']]

# Set the original CRS to EPSG:32633 (WGS 84 / UTM zone 33N)
gdf = gdf.set_crs(epsg=32633, allow_override=True)
# Convert to EPSG:4326
gdf = gdf.to_crs(epsg=4326)

# Output the content as JSON to stdout
sys.stdout.write(gdf.to_json())
