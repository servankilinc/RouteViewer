import e7 from "../utils/idGenerator";
import { AddNewFloor, SwipeFloor } from "./floorHandler";
import * as MapDrawer from "./mapDrawer";
import { Navigation } from "./navigation";
import { sync_polygon_UI, sync_path_UI } from "./syncUI";

export const floorList = [
  // {
  //   index: newIndex,
  //   id: e7(),
  //   name: `Kat ${newIndex}`,
  // }
];
export const graphList = [
  // { 
  //   floor: null,
  //   nodes: [],
  //   edges: [],
  //   graphGraphLib: null
  // }
];
export const polygons = [
{
"type": "Feature",
"properties": {
  "name": "Bina Girisi",
  "entrance": {
      "type": "Point",
      "coordinates": [
          33.08689,
          39.089718
      ],
      "id": "87115518-2cd1-4ded-922e-6edc60959581"
  }
},
"geometry": {
  "type": "Polygon",
  "coordinates": [
      [
          [
              33.086509,
              39.089585
          ],
          [
              33.086477,
              39.08951
          ],
          [
              33.087045,
              39.089397
          ],
          [
              33.087153,
              39.08958
          ],
          [
              33.086686,
              39.089814
          ],
          [
              33.086509,
              39.089585
          ]
      ]
  ]
},
"id": "085fe574-3bab-48c0-9776-ebb836362863",
"floor": 0,
"popupContent": "Bina Bilgisi (Dahiliye)",
"name": "Dahiliye"
},
{
"type": "Feature",
"properties": {
  "name": "Bina Girisi",
  "entrance": {
      "type": "Point",
      "coordinates": [
          33.087169,
          39.090609
      ],
      "id": "7cdbe760-9a0e-4f2b-a96c-907eeda45d23"
  }
},
"geometry": {
  "type": "Polygon",
  "coordinates": [
      [
          [
              33.087357,
              39.090929
          ],
          [
              33.087029,
              39.090975
          ],
          [
              33.086992,
              39.090613
          ],
          [
              33.087324,
              39.090588
          ],
          [
              33.087357,
              39.090929
          ]
      ]
  ]
},
"id": "3ffa1242-cdef-4625-bd65-44d8f79ff806",
"floor": 0,
"popupContent": "Bina Bilgisi (Kardiyoloji)",
"name": "Kardiyoloji"
}
];
export const paths = [];

$(document).ready(function(){
  AddNewFloor(0);
})


// SHOW Methods
window.ShowPathOnMap = function (pId) {
  if (drawnItems.getLayer(pId) != null) {
    // hide then
    MapDrawer.RemovePathFromMap(pId)
  } else {
    // show then
    MapDrawer.AddPathToMap(pId);
  }
  sync_path_UI();
};

window.DeletePathOnMap = function (pId){
  MapDrawer.DeletePath(pId);
  sync_path_UI();
};


window.ShowPolygonOnMap = function (pId) {
  if (drawnItems.getLayer(pId) != null) {
    // hide then
    MapDrawer.RemovePolygonFromMap(pId);
  } 
  else {
    // show then
    MapDrawer.AddPolygonToMap(pId);
  }
  sync_polygon_UI();
};

window.DeletePolygonOnMap = function (pId) {
  MapDrawer.DeletePolygon(pId);
  sync_polygon_UI();
};
 


window.EditPolygonOnMap = function (pId) {
  MapDrawer.ShowModalPolygonInformations(pId);
};

window.SavePolygonInfoChanges = function () {
  MapDrawer.UpdatePolygonInformations();
};


// -------------------- FLOOR PROCESSES --------------------
window.AddNewFloor = function (count) {
  AddNewFloor(count);
}
window.SwipeFloor = function (floorIndex) {
  SwipeFloor(floorIndex);
}
// -------------------- FLOOR PROCESSES --------------------



// -------------------- Navigation --------------------  
var selectedStartLocaltion = null;
var selectedTargetLocaltion = null;
$("#selectLocationStart").on("change", function (e) {
  selectedStartLocaltion = $("#selectLocationStart").val();
});

$("#selectLocationTarget").on("change", function (e) {
  selectedTargetLocaltion = $("#selectLocationTarget").val();
});

window.navigate = function () {
  clearRoutes();
  Navigation(selectedStartLocaltion, selectedTargetLocaltion, currentFloor.index);
};

window.clearRoutes = function () {
  drawnItemsRoute.eachLayer(function (layer) {
    drawnItemsRoute.removeLayer(layer);
  });
};
// -------------------- Navigation --------------------  


setTimeout(() => {
  // Poligonları haritaya ekleyelim
  L.geoJSON(polygons, {
      onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.name);
      }
  }).addTo(map);

  // Path (LineString) veri ekliyoruz
  // L.geoJSON(paths, {
  //     onEachFeature: function (feature, layer) {
  //         layer.bindPopup('Path');
  //     }
  // }).addTo(map);

  sync_polygon_UI();
  // sync_path_UI()
},2000)
