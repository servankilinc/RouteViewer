import e7 from "../utils/idGenerator";
import { paths, polygons } from "./app";
import { sync_polygon_UI, sync_path_UI } from "./syncUI";

map.on(L.Draw.Event.CREATED, function (event) {
  const layer = event.layer;
  const _id = e7();

  let geoJson = layer.toGeoJSON();
  geoJson.id = _id;
  geoJson.floor = currentFloor.index;
  layer._leaflet_id = _id;
  layer._leaflet_floor = currentFloor.index; 
  layer._typeOfData = geoJson.geometry.type;

  switch (geoJson.geometry.type) {
    case "Point":
      if (isEntrancePointAdded) {
        alert("Son Yapının Konum İşareti Zaten Atandı!");
      } 
      else if (isEntrancePointAdded && polygons.length == 0) {
        alert("Önce İşaretleneck Bir Yapı Oluşturmalısınız!");
      } 
      else {
        CreateEntrancePoint(geoJson, _id, layer);
      }
      break;
    case "Polygon":
      if (polygons.length == 0) {
        alert("Önce Bir Yapı Oluşturmalısınız!");
      } 
      if (isEntrancePointAdded) {
        alert("Oluşturulan Son Yapı İçin Konum İşaretlemelisiniz!");
      } 
      else {
        CreatePolygon(geoJson, _id, layer);
      }
      break;
    case "LineString":
      CreateLineString(geoJson, layer);
      break;
    default:
      break;
  }
  window.polygons = polygons;
  window.paths = paths;
});

// ******** Polygon, entrancepoint ve Path bilgileri güncelleniyor ********
map.on("draw:edited", function (e) {
  var layers = e.layers;
  layers.eachLayer(function (layer) {
    switch (layer._typeOfData) {
      case "Polygon":
        UpdatePolygon(layer);
        break;
      case "LineString":
        UpdateLineString(layer);
        break;
      case "Point":
        UpdateEntrancePoint(layer);
        break;
      default:
        break;
    }
  });
});



// --------- PATH METHODS ---------
function CreateLineString(geoJson, layer) {
  drawnItems.addLayer(layer);
  
  paths.push(geoJson);
  sync_path_UI();
}

function UpdateLineString(layer) {
  let lineToUpdate = paths.find((p) => p.id == layer._leaflet_id);
  lineToUpdate.geometry.coordinates = [];
  layer._latlngs.map(item => lineToUpdate.geometry.coordinates.push([item.lng, item.lat]));
}

export function AddPathToMap(pId) {
  var isExist = paths.some(p => p.id == pId);
  if (isExist != true) { return; }
  
  const selectedPath = paths.find((p) => p.id == pId);
  L.geoJSON(selectedPath, {
    onEachFeature: function (feature, layer) {
      layer._leaflet_id = selectedPath.id;
      layer._leaflet_floor = selectedPath.floor;
      layer._typeOfData = "LineString";
      drawnItems.addLayer(layer);
    },
  });
}

export function RemovePathFromMap(pId) {
  const pathLayer = drawnItems.getLayer(pId);
  if (pathLayer != null) {
    drawnItems.removeLayer(pathLayer);
  }
}

export function DeletePath(pId){
  var isExist = paths.some(p => p.id == pId);
  if (isExist != true) { return; }

  const _index = paths.findIndex((p) => p.id == pId);
  paths.splice(_index, 1);

  RemovePathFromMap(pId);
}
// --------- PATH METHODS ---------



// --------- POLYGON METHODS ---------
function CreatePolygon(geoJson, _id, layer) {
  drawnItems.addLayer(layer);
  
  polygons.push(geoJson);
  ShowModalPolygonInformations(_id);
  sync_polygon_UI();
  isEntrancePointAdded = false;
}

function UpdatePolygon(layer) {
  let polyToUpdate = polygons.find((p) => p.id == layer._leaflet_id);
  polyToUpdate.geometry.coordinates = [[]];
  layer._latlngs[0].map(item => polyToUpdate.geometry.coordinates[0].push([item.lng, item.lat]));
}

export function AddPolygonToMap(pId) {
  const isExist = polygons.find((p) => p.id == pId);
  if (isExist != true) { return; }

  const selectedPoly = polygons.find((p) => p.id == pId);
  L.geoJSON(selectedPoly, {
    onEachFeature: function (feature, layer) {
      layer._leaflet_id = selectedPoly.id;
      layer._leaflet_floor = selectedPoly.floor;
      layer._typeOfData = "Polygon";
      layer.bindPopup(selectedPoly.popupContent);
      drawnItems.addLayer(layer);
    },
  });
  let entrancePoint = selectedPoly.properties.entrance;
  L.geoJSON(entrancePoint, {
    onEachFeature: function (feature, layer) {
      layer._leaflet_id = entrancePoint.id;
      layer._leaflet_floor = selectedPoly.floor;
      layer._typeOfData = "Point";
      drawnItems.addLayer(layer);
    },
  });
}

export function RemovePolygonFromMap(pId) {
  const isExist = polygons.find((p) => p.id == pId);
  if (isExist != true) { return; }
  
  const poly = polygons.find((p) => p.id == pId);
  const polygonLayer = drawnItems.getLayer(pId);
  const entrancePointLayer = drawnItems.getLayer(poly.properties.entrance.id);

  if(polygonLayer != null){
    drawnItems.removeLayer(polygonLayer);
  }
  if(entrancePointLayer != null){
    drawnItems.removeLayer(entrancePointLayer);
  }
}

export function DeletePolygon(pId){
  var isExist = polygons.some(p => p.id == pId);
  if (isExist != true) { return; }

  const _index = polygons.findIndex((p) => p.id == pId);
  polygons.splice(_index, 1);
  
  RemovePolygonFromMap(pId);
}
// --------- POLYGON METHODS ---------


// --------- ENTRANCE POINT METHODS ---------
function CreateEntrancePoint(geoJson, _id, layer) {
  var polygon = polygons[polygons.length - 1];
  polygon.properties = {
    name: "Bina Girisi",
    entrance: {
      type: "Point",
      coordinates: geoJson.geometry.coordinates,
      id: _id,
    },
  };
  drawnItems.addLayer(layer);
  isEntrancePointAdded = true;
}

function UpdateEntrancePoint(layer) {
  let polygonToUpdate = polygons.find(p => p.properties.entrance.id == layer._leaflet_id);
  let item = layer._latlng;
  polygonToUpdate.properties.entrance.coordinates = [item.lng, item.lat];
}
// --------- ENTRANCE POINT METHODS ---------





// --------- POLYGON INFORMATION METHODS ---------
export function ShowModalPolygonInformations(pId) {
  var isExist = polygons.some(p => p.id == pId); 
  if (isExist != true){ return; }

  let poly = polygons.find(p => p.id == pId);
  $("#buildingName").val(poly.name);
  $("#modalSetPolyInfo").attr("currentPolyId", pId);
  $("#modalSetPolyInfo").show();
}

export function UpdatePolygonInformations() {
  var pId = $("#modalSetPolyInfo").attr("currentPolyId");

  var isExist = polygons.some(p => p.id == pId); 
  if (isExist != true){ return; }

  const poly = polygons.find((p) => p.id == pId);
  poly.name = $("#buildingName").val();
  poly.popupContent = `Bina: ${$("#buildingName").val()}`;

  var polygonLayer = drawnItems.getLayer(pId);
  if (polygonLayer != null){
    polygonLayer.setPopupContent(poly.popupContent);
  }

  $("#modalSetPolyInfo").hide();
  sync_polygon_UI();
}
// --------- POLYGON INFORMATION METHODS ---------