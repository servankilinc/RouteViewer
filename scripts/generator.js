import * as turf from "@turf/turf";

function createWallPolygon(inputGeoJSON, offsetRatio) {
  const { geometry, properties } = inputGeoJSON;

  if (geometry.type !== "Polygon") {
    throw new Error("Geometry type must be Polygon");
  }

  // Original Polygon
  const outerPolygon = turf.polygon(geometry.coordinates);
 
  const innerPolygon = turf.transformScale(outerPolygon, offsetRatio);
 
  // Create Offset Polygon
  const offsetPolygon = turf.transformScale(outerPolygon, 0.9);

  // Combine outer and inner coordinates to create a wall (a polygon with a hole)
  const wallPolygon = {
    type: "Polygon",
    coordinates: [
      geometry.coordinates[0], // Outer boundary
      innerPolygon.geometry.coordinates[0], // Inner boundary (hole)
    ],
  };

  const outputGeoJSON = 
    {
      type: "FeatureCollection",
      features: [
        {
            type: "Feature",
            properties: {
                name: properties.name,
                level: 1,
                base_height: 0,
                height: 20,
                color: "blue",
            },
            geometry: wallPolygon,
            id: inputGeoJSON.id || turf.randomId(),
        },
        {
            type: "Feature",
            properties: {
              name: properties.name,
              level: 1,
              base_height: 0,
              height: 3,
              color: "red",
            },
            geometry: offsetPolygon.geometry,
            id: inputGeoJSON.id || turf.randomId(),
        }
      ],
    };
  

  return outputGeoJSON;
}

var inputGeoJSON = {
  type: "Feature",
  properties: {
    name: "Bina Girisi",
    entrance: {
      type: "Point",
      coordinates: [33.087029, 39.091358],
      id: "c73a4721-0454-42b9-9426-30f2a8013f9f",
    },
  },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [33.08689, 39.091641],
        [33.08652, 39.091279],
        [33.086831, 39.091163],
        [33.087147, 39.091541],
        [33.08689, 39.091641],
      ],
    ],
  },
  id: "72c51f4f-dc27-4740-ae87-04d8032aa39a",
  floor: 0,
  popupContent: "Bina Bilgisi (Göz Polikliniği)",
  name: "Göz Polikliniği",
};

// Offset oranı (iç sınır için küçültme faktörü)
const offsetRatio = 0.9;

const result = createWallPolygon(inputGeoJSON, offsetRatio);
console.log(JSON.stringify(result, null, 2));
