import e7 from "../utils/idGenerator";
import { Navigation } from "./navigation";

var isEntrancePointAdded = false;

map.on(L.Draw.Event.CREATED, function (event) {
  const layer = event.layer;
  const _id = e7();

  let geoJson = layer.toGeoJSON();
  geoJson.id = _id;
  geoJson.floor = currentFloor.index;
  layer._leaflet_id = _id;
  layer._leaflet_floor = currentFloor.index;

  switch (geoJson.geometry.type) {
    case "Point":
      if (isEntrancePointAdded) {
        alert("Sony Yapının Konum İşareti Zaten Atandı!");
      } else if (isEntrancePointAdded && polygons.length == 0) {
        alert("İşaretleneck Bir Yapı Oluşturmalısınız!");
      } else {
        layer._typeOfData = "Point";
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
      break;
    case "Polygon":
      if (!isEntrancePointAdded && polygons.length != 0) {
        alert("Oluşturulan Son Yapı İçin Konum İşaretlemelisiniz!");
      } else {
        const popupContent = `Bina Bilgisi: (${_id})`;
        geoJson.popupContent = popupContent;
        polygons.push(geoJson);
        layer._typeOfData = "Polygon";
        layer.bindPopup(popupContent);
        drawnItems.addLayer(layer);

        showPolygonInfoEditModal(_id);
        sync_polygon_UI();
        isEntrancePointAdded = false;
      }
      break;
    case "LineString":
      layer._typeOfData = "LineString";
      paths.push(geoJson);
      drawnItems.addLayer(layer);

      sync_path_UI();
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
        let polyToUpdate = polygons.find((p) => p.id == layer._leaflet_id);
        polyToUpdate.geometry.coordinates = [[]];
        layer._latlngs[0].map((item) =>
          polyToUpdate.geometry.coordinates[0].push([item.lng, item.lat])
        );
        break;
      case "LineString":
        let lineToUpdate = paths.find((p) => p.id == layer._leaflet_id);
        lineToUpdate.geometry.coordinates = [];
        layer._latlngs.map((item) =>
          lineToUpdate.geometry.coordinates.push([item.lng, item.lat])
        );
        break;
      case "Point":
        let polygonToUpdate = polygons.find(
          (p) => p.properties.entrance.id == layer._leaflet_id
        );
        let item = layer._latlng;
        polygonToUpdate.properties.entrance.coordinates = [item.lng, item.lat];
        break;
      default:
        break;
    }
  });
});

function showPolygonInfoEditModal(pID) {
  $("#buildingName").val("");
  $("#modalSetPolyInfo").attr("currentPolyId", pID);
  $("#modalSetPolyInfo").show();
}

$("#btnSavePolyInfos").on("click", function () {
  const poly = polygons.find(
    (p) => p.id == $("#modalSetPolyInfo").attr("currentPolyId")
  );
  poly.name = $("#buildingName").val();

  var layer = drawnItems.getLayer($("#modalSetPolyInfo").attr("currentPolyId"));
  console.log("LAYER  TO EDIT = >", layer);
  poly.popupContent = `Bina Bilgisi (${$("#buildingName").val()})`;
  layer.setPopupContent(poly.popupContent);

  $("#modalSetPolyInfo").hide();
  sync_polygon_UI();
});

let currentFloor = null;
function sync_floor_UI() {
  floorList.sort((a, b) => a.index - b.index);
  console.log("SYNC FloorList => ", floorList);

  $("#floorList").html("");

  floorList.map((f) => {
    let isActive = f.id == currentFloor.id ? "active" : "";

    $("#floorList").append(
      '<div class="list-group-item list-group-item-action fw-light d-flex justify-content-between ' +
        isActive +
        '" onclick="SwipeFloor(\'' +
        f.index +
        "')\">" +
        "<span>" +
        f.name +
        "</span>" +
        "</div>"
    );
  });
}

function sync_path_UI() {
  console.log("SYNC Pahts => ", paths);

  $("#pathList").html(
    `<button type="button" class="list-group-item list-group-item-action bg-light text-primary fw-bold">Yollar</button>`
  );

  paths.map((p) => {
    if (p.floor != currentFloor.index) {
      return;
    }

    let btnShow =
      drawnItems.getLayer(p.id) == null
        ? '<div class="btn btn-primary btn-sm" onclick="ShowPathOnMap(\'' +
          p.id +
          '\')"><i class="fa-solid fa-eye fa-2xs"></i></div>'
        : '<div class="btn btn-secondary btn-sm" onclick="ShowPathOnMap(\'' +
          p.id +
          '\')"><i class="fa-solid fa-eye-slash fa-2xs"></i></div>';

    $("#pathList").append(
      '<div class="list-group-item list-group-item-action fw-light d-flex justify-content-between">' +
        "<span>" +
        p.id.substring(0, 13) +
        "</span>" +
        '<div class="d-flex gap-1">' +
        btnShow +
        '<div class="btn btn-danger btn-sm" onclick="DeletePathOnMap(\'' +
        p.id +
        '\')"><i class="fa-solid fa-trash fa-2xs"></i></div>' +
        "</div>" +
        "</div>"
    );
  });
}

function sync_polygon_UI() {
  console.log("SYNC polygons => ", polygons);

  $("#locationList").html(
    `<button type="button" class="list-group-item list-group-item-action bg-light text-primary fw-bold">Konumlar</button>`
  );

  $("#selectLocationStart").html(
    "<option disabled selected>Başlangıç Konumu Seçiniz</option>"
  );
  $("#selectLocationTarget").html(
    "<option disabled selected>Hedef Konumu Seçiniz</option>"
  );

  polygons.map((p) => {
    if (p.floor != currentFloor.index) {
      return;
    }

    $("#selectLocationStart").append(
      `<option value="${p.id}">${p.name}</option>`
    );
    $("#selectLocationTarget").append(
      `<option value="${p.id}">${p.name}</option>`
    );

    let btnShow =
      drawnItems.getLayer(p.id) == null
        ? '<div class="btn btn-primary btn-sm" onclick="ShowLocationOnMap(\'' +
          p.id +
          '\')"><i class="fa-solid fa-eye fa-2xs"></i></div>'
        : '<div class="btn btn-secondary btn-sm" onclick="ShowLocationOnMap(\'' +
          p.id +
          '\')"><i class="fa-solid fa-eye-slash fa-2xs"></i></div>';

    $("#locationList").append(
      '<div class="list-group-item list-group-item-action fw-light d-flex justify-content-between">' +
        "<span>" +
        p.name +
        "</span>" +
        '<div class="d-flex gap-1">' +
        '<div class="btn btn-warning btn-sm" onclick="EditInfoLocationOnMap(\'' +
        p.id +
        '\')"><i class="fa-solid fa-pen-to-square fa-2xs"></i></div>' +
        btnShow +
        '<div class="btn btn-danger btn-sm" onclick="DeleteLocationOnMap(\'' +
        p.id +
        '\')"><i class="fa-solid fa-trash fa-2xs"></i></div>' +
        "</div>" +
        "</div>"
    );
  });
}

// setTimeout(() => {
//     // Poligonları haritaya ekleyelim
//     L.geoJSON(polygons, {
//       onEachFeature: function (feature, layer) {
//           layer.bindPopup(feature.properties.name);
//       }
//   }).addTo(map);

//   // Path (LineString) veri ekliyoruz
//   L.geoJSON(paths, {
//       onEachFeature: function (feature, layer) {
//           layer.bindPopup('Path');
//       }
//   }).addTo(map);

//   sync_polygon_UI();
//   sync_path_UI()
// },2000)

// SHOW Methods
window.ShowPathOnMap = function (pID) {
  if (drawnItems.getLayer(pID) != null) {
    // hide then
    const selectedPath = drawnItems.getLayer(pID);
    drawnItems.removeLayer(selectedPath);
  } else {
    // show then
    AddPathToMap(pID);
  }
  sync_path_UI();
};
window.ShowLocationOnMap = function (pID) {
  if (drawnItems.getLayer(pID) != null) {
    // hide then
    const poly = polygons.find((p) => p.id == pID);
    const selectedLayer = drawnItems.getLayer(pID);
    const selectedLayerEntrancePoint = drawnItems.getLayer(
      poly.properties.entrance.id
    );
    drawnItems.removeLayer(selectedLayer);
    drawnItems.removeLayer(selectedLayerEntrancePoint);
  } else {
    // show then
    AddPolygonToMap(pID);
  }
  sync_polygon_UI();
};
function AddPathToMap(pID) {
  const selectedPath = paths.find((p) => p.id == pID);
  if (selectedPath != -1) {
    L.geoJSON(selectedPath, {
      onEachFeature: function (feature, layer) {
        layer._leaflet_id = selectedPath.id;
        layer._leaflet_floor = selectedPath.floor;
        layer._typeOfData = "LineString";
        drawnItems.addLayer(layer);
      },
    });
  }
}
function AddPolygonToMap(pID) {
  const selectedLocation = polygons.find((p) => p.id == pID);
  if (selectedLocation != -1) {
    L.geoJSON(selectedLocation, {
      onEachFeature: function (feature, layer) {
        layer._leaflet_id = selectedLocation.id;
        layer._leaflet_floor = selectedLocation.floor;
        layer._typeOfData = "Polygon";
        layer.bindPopup(selectedLocation.popupContent);
        drawnItems.addLayer(layer);
      },
    });
    let entrancePoint = selectedLocation.properties.entrance;
    L.geoJSON(entrancePoint, {
      onEachFeature: function (feature, layer) {
        layer._leaflet_id = entrancePoint.id;
        layer._leaflet_floor = selectedLocation.floor;
        layer._typeOfData = "Point";
        drawnItems.addLayer(layer);
      },
    });
  }
}

// DELETE Methods
window.DeletePathOnMap = function (pID) {
  const _index = paths.findIndex((p) => p.id == pID);
  if (_index == -1) {
    return;
  }
  const selectedLayer = drawnItems.getLayer(pID);
  if (drawnItems.getLayer(pID) != null) {
    // haritadan hide edilmiş zaten
    drawnItems.removeLayer(selectedLayer);
  }
  paths.splice(_index, 1);
  sync_path_UI();
};
window.DeleteLocationOnMap = function (pID) {
  const _index = polygons.findIndex((p) => p.id == pID);
  if (_index == -1) {
    return;
  }
  const selectedLayer = drawnItems.getLayer(pID);
  if (drawnItems.getLayer(pID) != null) {
    // haritadan hide edilmiş zaten
    drawnItems.removeLayer(selectedLayer);
  }
  polygons.splice(_index, 1);
  sync_polygon_UI();
};

// Edit Methods
window.EditInfoLocationOnMap = function (pID) {
  let poly = polygons.find((p) => p.id == pID);
  $("#buildingName").val(poly.name);
  $("#modalSetPolyInfo").attr("currentPolyId", pID);
  $("#modalSetPolyInfo").show();
};

// Floor Processes
window.AddNewFloor = function (count) {
  if (count == 0) {
    let floorObj = {
      index: 0,
      id: e7(),
      name: "Giriş Katı",
    };
    floorList.push(floorObj);
    currentFloor = floorObj;
  } else if (count == +1) {
    let indexArr = floorList.map((f) => f.index);
    let newIndex = Math.max(...indexArr) + 1;
    let floorObj = {
      index: newIndex,
      id: e7(),
      name: `Kat ${newIndex}`,
    };
    floorList.push(floorObj);
  } else {
    let indexArr = floorList.map((f) => f.index);
    let newIndex = Math.min(...indexArr) - 1;
    let floorObj = {
      index: newIndex,
      id: e7(),
      name: `Kat ${newIndex}`,
    };
    floorList.push(floorObj);
  }

  sync_floor_UI();
};

window.SwipeFloor = function (floorIndex) {
  currentFloor = floorList.find((f) => f.index == floorIndex);

  polygons.map((p) => {
    if (p.floor == currentFloor.index) {
      AddPolygonToMap(p.id);
    }
  });
  paths.map((p) => {
    if (p.floor == currentFloor.index) {
      AddPathToMap(p.id);
    }
  });
  drawnItems.eachLayer(function (layer) {
    if (layer._leaflet_floor != currentFloor.index) {
      drawnItems.removeLayer(layer);
    }
  });

  sync_floor_UI();
  sync_path_UI();
  sync_polygon_UI();
};

// navigation process
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
  Navigation(selectedStartLocaltion, selectedTargetLocaltion);
};

window.clearRoutes = function () {
  drawnItemsRoute.eachLayer(function (layer) {
    drawnItemsRoute.removeLayer(layer);
  });
};
