import * as turf from "@turf/turf";

// -------- Resim KONTROL -----------
let imageOpacityValue = 0.7;
let imageBounds = [
  [39.089, 33.089], //  batı kuey (latitude, longitude)
  [39.09, 33.089], //  doğu kuzey (latitude, longitude)
  [39.09, 33.091], //  doğu güney(latitude, longitude)
  [39.089, 33.091], //  batı güney (latitude, longitude)
];

const imageControlPolygon = new L.Polygon([imageBounds], {
  draggable: true,
  fillOpacity: 0,
}).addTo(map);
// Resmi ekle
const imageOverlay = L.imageOverlay.rotated(
  "../assets/kroki.png",
  L.latLng(imageBounds[0]),
  L.latLng(imageBounds[1]),
  L.latLng(imageBounds[3]),
  {
    opacity: imageOpacityValue,
    interactive: true,
  }
);
map.addLayer(imageOverlay);

imageControlPolygon.on("drag, dragend", function (e) {
  const currentBounds = imageControlPolygon.getLatLngs()[0];

  // image set
  resizeImage(currentBounds);
 
  if(imageRotationDeg == 0){
    setEastSizer(currentBounds);
    setWestSizer(currentBounds);
    setSouthSizer(currentBounds);
    setNorthSizer(currentBounds);
  }else{
    setEastSizerOnRotate(currentBounds);
    setWestSizerOnRotate(currentBounds);
    setSouthSizerOnRotate(currentBounds);
    setNorthSizerOnRotate(currentBounds);
  }
 
});

window.increaseImageOpacity = function () {
  imageOpacityValue = imageOpacityValue + 0.1 > 1 ? 1 : imageOpacityValue + 0.1;
  imageOverlay.setOpacity(imageOpacityValue);
};

window.decreaseImageOpacity = function () {
  imageOpacityValue = imageOpacityValue - 0.1 < 0 ? 0 : imageOpacityValue - 0.1;
  imageOverlay.setOpacity(imageOpacityValue);
};

let markerSouth = L.marker([imageBounds[0][0],imageBounds[0][1]], { draggable: true }).addTo(map);
let markerNorth = L.marker([imageBounds[1][0],imageBounds[1][1]], { draggable: true }).addTo(map);
let markerWest = L.marker([imageBounds[2][0], imageBounds[2][1]], { draggable: true }).addTo(map);
let markerEast = L.marker([imageBounds[3][0],imageBounds[3][1]], { draggable: true }).addTo(map);

markerNorth.on("drag", function () {
 
    var currentBounds = imageControlPolygon.getLatLngs()[0];
 
    currentBounds[1].lat = markerNorth.getLatLng().lat;
    currentBounds[1].lng =markerNorth.getLatLng().lng;
 // markerNorth.getLatLng(), markerSouth.getLatLng(), markerEast.getLatLng(), markerWest.getLatLng()
    imageControlPolygon.setLatLngs([currentBounds]);

    resizeImage(currentBounds);
});

markerEast.on("drag", function () {
    var currentBounds = imageControlPolygon.getLatLngs()[0];
 
    currentBounds[3].lat = markerEast.getLatLng().lat;
    currentBounds[3].lng =markerEast.getLatLng().lng;
 // markerNorth.getLatLng(), markerSouth.getLatLng(), markerEast.getLatLng(), markerWest.getLatLng()
    imageControlPolygon.setLatLngs([currentBounds]);

    resizeImage(currentBounds); 
});

markerSouth.on("drag", function () { 
    var currentBounds = imageControlPolygon.getLatLngs()[0];
 
    currentBounds[0].lat = markerSouth.getLatLng().lat;
    currentBounds[0].lng =markerSouth.getLatLng().lng;
 // markerNorth.getLatLng(), markerSouth.getLatLng(), markerEast.getLatLng(), markerWest.getLatLng()
    imageControlPolygon.setLatLngs([currentBounds]);

    resizeImage(currentBounds); 
});

markerWest.on("drag", function () {
     
    var currentBounds = imageControlPolygon.getLatLngs()[0];
 
    currentBounds[2].lat = markerWest.getLatLng().lat;
    currentBounds[2].lng =markerWest.getLatLng().lng;
 // markerNorth.getLatLng(), markerSouth.getLatLng(), markerEast.getLatLng(), markerWest.getLatLng()
    imageControlPolygon.setLatLngs([currentBounds]);

    resizeImage(currentBounds); 
});

function resizeImage(currentBounds) {
  const updatedTopLeft = L.latLng(currentBounds[0].lat, currentBounds[0].lng);
  const updatedTopRight = L.latLng(currentBounds[1].lat, currentBounds[1].lng);
  const updatedBottomRight = L.latLng(
    currentBounds[2].lat,
    currentBounds[2].lng
  );
  const updatedBottomLeft = L.latLng(
    currentBounds[3].lat,
    currentBounds[3].lng
  );

  imageOverlay.reposition(updatedTopLeft, updatedTopRight, updatedBottomLeft);
}

const setNorthSizer = (currentBounds) => {
  const newMidPoint = markerNorth.getLatLng();
  markerNorth.setLatLng({
    lat: currentBounds[1].lat, // newMidPoint.lat,
    lng: currentBounds[1].lng, // currentBounds[2].lng  / 2
  });
};
const setEastSizer = (currentBounds) => {
  const newMidPoint = markerEast.getLatLng();
  markerEast.setLatLng({
    lat: currentBounds[0].lat, // currentBounds[1].lat / 2
    lng: currentBounds[2].lng, // newMidPoint.lng,
  });
};
const setSouthSizer = (currentBounds) => {
  const newMidPoint = markerSouth.getLatLng();
  markerSouth.setLatLng({
    lat: currentBounds[0].lat, // newMidPoint.lat,
    lng: currentBounds[0].lng, // currentBounds[3].lng / 2
  });
};
const setWestSizer = (currentBounds) => {
  const newMidPoint = markerWest.getLatLng();
  markerWest.setLatLng({
    lat: currentBounds[1].lat, //+ currentBounds[1].lat / 2
    lng: currentBounds[3].lng, // newMidPoint.lng,
  });
};

const setNorthSizerOnRotate = (rotatedBounds) => {
  const midpoint = turf.midpoint(
    turf.point([rotatedBounds[1].lng, rotatedBounds[1].lat]),
    turf.point([rotatedBounds[2].lng, rotatedBounds[2].lat])
  );
  const midpointCoords = midpoint.geometry.coordinates;

  markerNorth.setLatLng([rotatedBounds[1].lat, rotatedBounds[1].lng]);//[midpointCoords[1], midpointCoords[0]]
};
const setWestSizerOnRotate = (rotatedBounds) => {
  const midpoint = turf.midpoint(
    turf.point([rotatedBounds[0].lng, rotatedBounds[0].lat]),
    turf.point([rotatedBounds[1].lng, rotatedBounds[1].lat])
  );
  const midpointCoords = midpoint.geometry.coordinates;

  markerWest.setLatLng([rotatedBounds[2].lat, rotatedBounds[2].lng]);// [midpointCoords[1], midpointCoords[0]]
};
const setSouthSizerOnRotate = (rotatedBounds) => {
  const midpoint = turf.midpoint(
    turf.point([rotatedBounds[0].lng, rotatedBounds[0].lat]),
    turf.point([rotatedBounds[3].lng, rotatedBounds[3].lat])
  );
  const midpointCoords = midpoint.geometry.coordinates;

  markerSouth.setLatLng([rotatedBounds[0].lat, rotatedBounds[0].lng]); // [midpointCoords[1], midpointCoords[0]]
};
const setEastSizerOnRotate = (rotatedBounds) => {
  const midpoint = turf.midpoint(
    turf.point([rotatedBounds[2].lng, rotatedBounds[2].lat]),
    turf.point([rotatedBounds[3].lng, rotatedBounds[3].lat])
  );
  const midpointCoords = midpoint.geometry.coordinates;

  markerEast.setLatLng([rotatedBounds[3].lat, rotatedBounds[3].lng]);// [midpointCoords[1], midpointCoords[0]]
};

function calculateRotation(center, points, angle) {
  const angleRad = (Math.PI / 180) * angle;
  return points.map((point) => {
    const latDiff = point.lat - center.lat;
    const lngDiff = point.lng - center.lng;

    const rotatedLat =
      center.lat + latDiff * Math.cos(angleRad) - lngDiff * Math.sin(angleRad);
    const rotatedLng =
      center.lng + latDiff * Math.sin(angleRad) + lngDiff * Math.cos(angleRad);

    return { lat: rotatedLat, lng: rotatedLng };
  });
}

function rotateImage(angle) {
  imageRotationDeg =
    imageRotationDeg + angle >= 360 || imageRotationDeg + angle <= -360
      ? (imageRotationDeg + angle) % 360
      : imageRotationDeg + angle;
  const currentBounds = imageControlPolygon.getLatLngs()[0];
  const center = L.latLngBounds(currentBounds).getCenter();

  const rotatedBounds = calculateRotation(center, currentBounds, angle);

  imageControlPolygon.setLatLngs([rotatedBounds]);

  resizeImage(rotatedBounds);

  // Sizer Settings For Rotatation
  setWestSizerOnRotate(rotatedBounds);
  setEastSizerOnRotate(rotatedBounds);
  setNorthSizerOnRotate(rotatedBounds);
  setSouthSizerOnRotate(rotatedBounds);
}

var imageRotationDeg = 0;
window.rotate1 = function () {
  rotateImage(-5); // Saat yönünün tersine 10 derece döndür
};
window.rotate2 = function () {
  rotateImage(5); // Saat yönüne 10 derece döndür
};
