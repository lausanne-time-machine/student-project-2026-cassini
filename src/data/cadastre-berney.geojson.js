import proj4 from 'proj4';
import shp from 'shpjs';
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Define the Swiss CH1903+/LV95 (EPSG:2056) and WGS84 (EPSG:4326) coordinate systems
proj4.defs('EPSG:2056', '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

// Create a transformation function
const transformCoords = (coords) => {
    // Check if we're dealing with a single coordinate pair or nested arrays
    if (typeof coords[0] !== 'number') {
        return coords.map(transformCoords);
    }

    // Convert from Swiss projection to WGS84 (long, lat)
    return proj4('EPSG:2056', 'EPSG:4326', coords);
};

const transformBbox = (bbox) => {
    // A bbox is an array of four numbers [minX, minY, maxX, maxY]
    // We want to convert each of the four corners
    // Check if the bbox is an array of four numbers
    if (bbox.length !== 4) {
        throw new Error('Invalid bbox format. Expected an array of four numbers.');
    }
    // Transform each corner of the bbox
    const transformedBbox = [
        ...transformCoords([bbox[0], bbox[1]]), // minX, minY
        ...transformCoords([bbox[2], bbox[3]])  // maxX, maxY
    ];
    // Return the transformed bbox as an array of four numbers
    return transformedBbox;
};

// Transform the geometry of a GeoJSON feature
const transformGeometry = (geometry) => {
    // Check if the geometry is null or undefined
    // if there is no geometry, return null
    if (!geometry || geometry.length === 0) {
        return null;
    }

    return {
        ...geometry,
        bbox: geometry.bbox ? transformBbox(geometry.bbox) : null,
        coordinates: transformCoords(geometry.coordinates)
    };
};

var featureCounter = 0;

// Transform a GeoJSON feature
const transformFeature = (feature) => {
    return {
        ...feature,
        id: ++featureCounter,
        geometry: transformGeometry(feature.geometry),
        properties: {
            ...feature.properties,
            // Add any additional properties you want to include
            featureId: featureCounter,
        }
    };
};

// Transform a GeoJSON object (FeatureCollection or single Feature)
const transformGeoJSON = (geojson) => {
    if (geojson.type === 'FeatureCollection') {
        return {
            ...geojson,
            features: geojson.features.map(transformFeature)
        };
    } else if (geojson.type === 'Feature') {
        return transformFeature(geojson);
    }
    return geojson;
};

try {
    const sourceFile = './Berney_merge_legende_v6-3bis-save.zip';
    const sourceData = await readFile(fileURLToPath(import.meta.resolve(sourceFile)));
    
    // Read the shapefile data and convert it to GeoJSON
    const geojson = await shp(sourceData);

    // Transform coordinates from Swiss CH1903+/LV95 to WGS84
    const transformedData = transformGeoJSON(geojson);

    // Add metadata about the transformation
    transformedData.metadata = {
        ...transformedData.metadata,
        coordinateSystem: 'WGS84 (EPSG:4326)',
        originalCoordinateSystem: 'Swiss CH1903+/LV95 (EPSG:2056)',
        transformedAt: new Date().toISOString()
    };

    process.stdout.write(JSON.stringify(transformedData));
} catch (error) {
    console.error('Error loading or transforming GeoJSON data:', error);
    throw error;
}