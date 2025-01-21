// paths, polygons, floorList, currentFloor, drawnItems

import { floorList, paths, polygons } from "./app";

export function sync_path_UI()
{
  console.log("SYNC Pahts => ", paths);

  $("#pathList").html(`<button type="button" class="list-group-item list-group-item-action bg-light text-primary fw-bold">Yollar</button>`);
  
  paths.map((p) => {
    if (p.floor != currentFloor.index) {
      return;
    }

    let btnShow = drawnItems.getLayer(p.id) == null ? 
      '<div class="btn btn-primary btn-sm" onclick="ShowPathOnMap(\'' + p.id + '\')"><i class="fa-solid fa-eye fa-2xs"></i></div>' :
      '<div class="btn btn-secondary btn-sm" onclick="ShowPathOnMap(\'' + p.id + '\')"><i class="fa-solid fa-eye-slash fa-2xs"></i></div>';

    $("#pathList").append(
      '<div class="list-group-item list-group-item-action fw-light d-flex justify-content-between">' +
        "<span>" + p.id.substring(0, 8) + "</span>" +
        '<div class="d-flex gap-1">' + btnShow +
          '<div class="btn btn-danger btn-sm" onclick="DeletePathOnMap(\'' + p.id + '\')"><i class="fa-solid fa-trash fa-2xs"></i></div>' +
        "</div>" +
      "</div>"
    );
  });
}

export function sync_polygon_UI()
{
  console.log("SYNC polygons => ", polygons);

  $("#locationList").html(`<button type="button" class="list-group-item list-group-item-action bg-light text-primary fw-bold">Konumlar</button>`);
  $("#selectLocationStart").html("<option disabled selected>Başlangıç Konumu Seçiniz</option>");
  $("#selectLocationTarget").html("<option disabled selected>Hedef Konumu Seçiniz</option>");

  polygons.map((p) => {
    $("#selectLocationStart").append(`<option value="${p.id}">${p.name}</option>`);
    $("#selectLocationTarget").append(`<option value="${p.id}">${p.name}</option>`);
    
    if (p.floor != currentFloor.index) {
      return;
    }

    let btnShow = drawnItems.getLayer(p.id) == null ?
      '<div class="btn btn-primary btn-sm" onclick="ShowPolygonOnMap(\'' + p.id + '\')"><i class="fa-solid fa-eye fa-2xs"></i></div>' :
      '<div class="btn btn-secondary btn-sm" onclick="ShowPolygonOnMap(\'' + p.id + '\')"><i class="fa-solid fa-eye-slash fa-2xs"></i></div>';

    $("#locationList").append(
      '<div class="list-group-item list-group-item-action fw-light d-flex justify-content-between">' +
        "<span>" + p.name + "</span>" +
        '<div class="d-flex gap-1">' +
          '<div class="btn btn-warning btn-sm" onclick="EditPolygonOnMap(\'' + p.id + '\')"><i class="fa-solid fa-pen-to-square fa-2xs"></i></div>' +
          btnShow +
          '<div class="btn btn-danger btn-sm" onclick="DeletePolygonOnMap(\'' + p.id + '\')"><i class="fa-solid fa-trash fa-2xs"></i></div>' +
        "</div>" +
      "</div>"
    );
  });
}

export function sync_floor_UI()
{
  floorList.sort((a, b) => b.index - a.index);
  console.log("SYNC FloorList => ", floorList);

  $("#floorList").html("");

  floorList.map((f) => {
    let isActive = f.id == currentFloor.id ? "active" : "";

    $("#floorList").append(
      '<div class="list-group-item list-group-item-action fw-light d-flex justify-content-between ' + isActive + '" onclick="SwipeFloor(\'' + f.index + "')\">" +
        "<span>" + f.name + "</span>" +
      "</div>"
    );
  });
}