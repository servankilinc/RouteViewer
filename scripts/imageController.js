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

  if (imageRotationDeg != 0) {
    console.log("On rotation");
    setEastSizerOnRotate(currentBounds);
    setWestSizerOnRotate(currentBounds);
    setSouthSizerOnRotate(currentBounds);
    setNorthSizerOnRotate(currentBounds);
  } else {
    console.log("Without rotation");
    setEastSizer(currentBounds);
    setWestSizer(currentBounds);
    setSouthSizer(currentBounds);
    setNorthSizer(currentBounds);
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

let markerNorth = L.marker(
  [
    (imageBounds[1][0] + imageBounds[2][0]) / 2,
    (imageBounds[0][1] + imageBounds[2][1]) / 2,
  ],
  { draggable: true }
).addTo(map);
let markerSouth = L.marker(
  [
    (imageBounds[0][0] + imageBounds[3][0]) / 2,
    (imageBounds[0][1] + imageBounds[2][1]) / 2,
  ],
  { draggable: true }
).addTo(map);
let markerWest = L.marker(
  [
    (imageBounds[0][0] + imageBounds[1][0]) / 2,
    (imageBounds[2][1] + imageBounds[3][1]) / 2,
  ],
  { draggable: true }
).addTo(map);
let markerEast = L.marker(
  [
    (imageBounds[0][0] + imageBounds[1][0]) / 2,
    (imageBounds[0][1] + imageBounds[1][1]) / 2,
  ],
  { draggable: true }
).addTo(map);

markerNorth.on("drag", function () {
  const newMidPoint = markerNorth.getLatLng();
  var currentBounds = imageControlPolygon.getLatLngs()[0];
  if (imageRotationDeg != 0) {
    const rotationAngleRad = ((90 - imageRotationDeg) * Math.PI) / 180; // Dereceyi radyana çevir

    // Turf.js için kapalı poligon oluştur
    var temp = [
      [currentBounds[0].lng, currentBounds[0].lat],
      [currentBounds[2].lng, currentBounds[2].lat],
    ]; 
    const polygon = turf.lineString(temp);

    // Görselin merkezi
    const center = turf.centroid(polygon).geometry.coordinates;

    // Marker'ın mevcut konumu
    const dx = newMidPoint.lng - center[0];
    const dy = newMidPoint.lat - center[1];

    // Yalnızca dönüş doğrultusuna sınırla
    const distance = Math.sqrt(dx * dx + dy * dy); // Marker'ın merkezden uzaklığı sabit kalmalı
    const projectedLng = center[0] + distance * Math.cos(rotationAngleRad);
    const projectedLat = center[1] + distance * Math.sin(rotationAngleRad);

    // Marker'ı sınırla
    markerNorth.setLatLng({
      lat: projectedLat,
      lng: projectedLng,
    });

    currentBounds[1].lat = projectedLat;
    currentBounds[2].lat = projectedLat;

    imageControlPolygon.setLatLngs([currentBounds]);

    resizeImage(currentBounds);

  } else {
    currentBounds[1].lat = newMidPoint.lat;
    currentBounds[2].lat = newMidPoint.lat;

    imageControlPolygon.setLatLngs([currentBounds]);

    resizeImage(currentBounds);

    setNorthSizer(currentBounds);
    setWestSizer(currentBounds);
    setEastSizer(currentBounds);
  }
});

markerEast.on("drag", function () {
  const newMidPoint = markerEast.getLatLng();
  var currentBounds = imageControlPolygon.getLatLngs()[0];
  console.log("EAST");
  if (imageRotationDeg != 0) {
    const rotationAngleRad = (-imageRotationDeg * Math.PI) / 180; // Dereceyi radyana çevir

    // Turf.js için kapalı poligon oluştur
    var temp = [
      [currentBounds[0].lng, currentBounds[0].lat],
      [currentBounds[2].lng, currentBounds[2].lat],
    ]; 
    const polygon = turf.lineString(temp);
    // Görselin merkezi
    const center = turf.centroid(polygon).geometry.coordinates;

    // Marker'ın mevcut konumu
    const dx = newMidPoint.lng - center[0];
    const dy = newMidPoint.lat - center[1];

    // Yalnızca dönüş doğrultusuna sınırla
    const distance = Math.sqrt(dx * dx + dy * dy); // Marker'ın merkezden uzaklığı sabit kalmalı
    const projectedLng = center[0] + distance * Math.cos(rotationAngleRad);
    const projectedLat = center[1] + distance * Math.sin(rotationAngleRad);

    // Marker'ı sınırla
    markerEast.setLatLng({
      lat: projectedLat,
      lng: projectedLng,
    });

    currentBounds[2].lat = projectedLat;
    currentBounds[3].lat = projectedLat;

    imageControlPolygon.setLatLngs([currentBounds]);

    resizeImage(currentBounds);
  } else {
    currentBounds[2].lng = newMidPoint.lng;
    currentBounds[3].lng = newMidPoint.lng;

    imageControlPolygon.setLatLngs([currentBounds]);

    resizeImage(currentBounds);

    setEastSizer(currentBounds);
    setNorthSizer(currentBounds);
    setSouthSizer(currentBounds);
  }
});

markerSouth.on("drag", function () {
  const newMidPoint = markerSouth.getLatLng();
  var currentBounds = imageControlPolygon.getLatLngs()[0];
  if (imageRotationDeg != 0) {
    const rotationAngleRad = ((270 - imageRotationDeg) * Math.PI) / 180; // Dereceyi radyana çevir

    // Turf.js için kapalı poligon oluştur
    var temp = [
      [currentBounds[0].lng, currentBounds[0].lat],
      [currentBounds[2].lng, currentBounds[2].lat],
    ]; 
    const polygon = turf.lineString(temp);

    // Görselin merkezi
    const center = turf.centroid(polygon).geometry.coordinates;

    // Marker'ın mevcut konumu
    const dx = newMidPoint.lng - center[0];
    const dy = newMidPoint.lat - center[1];

    // Yalnızca dönüş doğrultusuna sınırla
    const distance = Math.sqrt(dx * dx + dy * dy); // Marker'ın merkezden uzaklığı sabit kalmalı
    const projectedLng = center[0] + distance * Math.cos(rotationAngleRad);
    const projectedLat = center[1] + distance * Math.sin(rotationAngleRad);

    // Marker'ı sınırla
    markerSouth.setLatLng({
      lat: projectedLat,
      lng: projectedLng,
    });

    currentBounds[0].lat = projectedLat;
    currentBounds[3].lat = projectedLat;

    imageControlPolygon.setLatLngs([currentBounds]);

    resizeImage(currentBounds);
  } else {
    currentBounds[0].lat = newMidPoint.lat;
    currentBounds[3].lat = newMidPoint.lat;

    imageControlPolygon.setLatLngs([currentBounds]);

    resizeImage(currentBounds);

    setSouthSizer(currentBounds);
    setWestSizer(currentBounds);
    setEastSizer(currentBounds);
  }
});

markerWest.on("drag", function () {
  const newMidPoint = markerWest.getLatLng();
  var currentBounds = imageControlPolygon.getLatLngs()[0];
  console.log("WEST");

  if (imageRotationDeg != 0) {
    const rotationAngleRad = ((90 - imageRotationDeg) * Math.PI) / 180; // Dereceyi radyana çevir

    // Turf.js için kapalı poligon oluştur
    var temp = [
      [currentBounds[0].lng, currentBounds[0].lat],
      [currentBounds[2].lng, currentBounds[2].lat],
    ]; 
    const polygon = turf.lineString(temp);

    // Görselin merkezi
    const center = turf.centroid(polygon).geometry.coordinates;

    // Marker'ın mevcut konumu
    const dx = newMidPoint.lng - center[0];
    const dy = newMidPoint.lat - center[1];

    const southRotationAngleRad = rotationAngleRad + Math.PI / 2;
    // Yalnızca dönüş doğrultusuna sınırla
    const distance = Math.sqrt(dx * dx + dy * dy); // Marker'ın merkezden uzaklığı sabit kalmalı
    const projectedLng = center[0] + distance * Math.cos(southRotationAngleRad);
    const projectedLat = center[1] + distance * Math.sin(southRotationAngleRad);

    // Marker'ı sınırla
    markerWest.setLatLng({
      lat: projectedLat,
      lng: projectedLng,
    });

    currentBounds[0].lat = projectedLat;
    currentBounds[1].lat = projectedLat;

    imageControlPolygon.setLatLngs([currentBounds]);

    resizeImage(currentBounds);
  } else {
    currentBounds[0].lng = newMidPoint.lng;
    currentBounds[1].lng = newMidPoint.lng;

    imageControlPolygon.setLatLngs([currentBounds]);

    resizeImage(currentBounds);

    setWestSizer(currentBounds);
    setNorthSizer(currentBounds);
    setSouthSizer(currentBounds);
  }
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
    lng: (currentBounds[1].lng + currentBounds[2].lng) / 2, // Sabit boylam
  });
};
const setEastSizer = (currentBounds) => {
  const newMidPoint = markerEast.getLatLng();
  markerEast.setLatLng({
    lat: (currentBounds[0].lat + currentBounds[1].lat) / 2,
    lng: currentBounds[2].lng, // newMidPoint.lng,
  });
};
const setSouthSizer = (currentBounds) => {
  const newMidPoint = markerSouth.getLatLng();
  markerSouth.setLatLng({
    lat: currentBounds[0].lat, // newMidPoint.lat,
    lng: (currentBounds[0].lng + currentBounds[3].lng) / 2, // Sabit boylam
  });
};
const setWestSizer = (currentBounds) => {
  const newMidPoint = markerWest.getLatLng();
  markerWest.setLatLng({
    lat: (currentBounds[0].lat + currentBounds[1].lat) / 2, // Sabit enlem
    lng: currentBounds[0].lng, // newMidPoint.lng,
  });
};

const setNorthSizerOnRotate = (rotatedBounds) => {
  const midpoint = turf.midpoint(
    turf.point([rotatedBounds[1].lng, rotatedBounds[1].lat]),
    turf.point([rotatedBounds[2].lng, rotatedBounds[2].lat])
  );
  const midpointCoords = midpoint.geometry.coordinates;

  markerNorth.setLatLng([midpointCoords[1], midpointCoords[0]]);
};
const setWestSizerOnRotate = (rotatedBounds) => {
  const midpoint = turf.midpoint(
    turf.point([rotatedBounds[0].lng, rotatedBounds[0].lat]),
    turf.point([rotatedBounds[1].lng, rotatedBounds[1].lat])
  );
  const midpointCoords = midpoint.geometry.coordinates;

  markerWest.setLatLng([midpointCoords[1], midpointCoords[0]]);
};
const setSouthSizerOnRotate = (rotatedBounds) => {
  const midpoint = turf.midpoint(
    turf.point([rotatedBounds[0].lng, rotatedBounds[0].lat]),
    turf.point([rotatedBounds[3].lng, rotatedBounds[3].lat])
  );
  const midpointCoords = midpoint.geometry.coordinates;

  markerSouth.setLatLng([midpointCoords[1], midpointCoords[0]]);
};
const setEastSizerOnRotate = (rotatedBounds) => {
  const midpoint = turf.midpoint(
    turf.point([rotatedBounds[2].lng, rotatedBounds[2].lat]),
    turf.point([rotatedBounds[3].lng, rotatedBounds[3].lat])
  );
  const midpointCoords = midpoint.geometry.coordinates;

  markerEast.setLatLng([midpointCoords[1], midpointCoords[0]]);
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

  L.circle(rotatedBounds[0], {
    fillColor: "blue",
    fillOpacity: 0.5,
    radius: 5,
  }).addTo(map);
  L.circle(rotatedBounds[1], {
    fillColor: "green",
    fillOpacity: 0.5,
    radius: 5,
  }).addTo(map);
  L.circle(rotatedBounds[2], {
    fillColor: "orange",
    fillOpacity: 0.5,
    radius: 5,
  }).addTo(map);
  L.circle(rotatedBounds[3], {
    fillColor: "red",
    fillOpacity: 0.5,
    radius: 5,
  }).addTo(map);
}

var imageRotationDeg = 0;
window.rotate1 = function () {
  rotateImage(-5); // Saat yönünün tersine 10 derece döndür
};
window.rotate2 = function () {
  rotateImage(5); // Saat yönüne 10 derece döndür
};
