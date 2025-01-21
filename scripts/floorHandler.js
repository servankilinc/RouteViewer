import e7 from "../utils/idGenerator";
import { sync_floor_UI, sync_polygon_UI, sync_path_UI } from "./syncUI";
import * as MapDrawer from "./mapDrawer";
import { Graph } from "graphlib";
import { floorList, graphList, paths, polygons } from "./app";

export function AddNewFloor (count) {
  if (count == 0)
  {
    let floorObj = {
      index: 0,
      id: e7(),
      name: "Giriş Katı",
    };

    let graphObj = {
      floor: 0,
      nodes: [],
      edges: [],
      graphGraphLib: new Graph()
    };

    graphList.push(graphObj);
    floorList.push(floorObj);
    currentFloor = floorObj;
  }
  else if (count == +1) 
  {
    let indexArr = floorList.map((f) => f.index);
    let newIndex = Math.max(...indexArr) + 1;

    let floorObj = {
      index: newIndex,
      id: e7(),
      name: `Kat ${newIndex}`,
    };

    let graphObj = { 
      floor: newIndex,
      nodes: [],
      edges: [],
      graphGraphLib: new Graph()
    };

    graphList.push(graphObj);
    floorList.push(floorObj);
  }
  else
  {
    let indexArr = floorList.map((f) => f.index);
    let newIndex = Math.min(...indexArr) - 1;
    
    let floorObj = {
      index: newIndex,
      id: e7(),
      name: `Kat ${newIndex}`,
    };

    let graphObj = { 
      floor: newIndex,
      nodes: [],
      edges: [],
      graphGraphLib: new Graph()
    };

    graphList.push(graphObj);
    floorList.push(floorObj);
  }

  sync_floor_UI();
};

export function SwipeFloor(floorIndex) {
  currentFloor = floorList.find((f) => f.index == floorIndex);
  console.log(" floorList = ", floorList)
  console.log(" currentFloor = ", currentFloor)
  
  polygons.map((p) => {
    if (p.floor == currentFloor.index) {
      MapDrawer.AddPolygonToMap(p.id);
    }
  });
  paths.map((p) => {
    if (p.floor == currentFloor.index) {
      MapDrawer.AddPathToMap(p.id);
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
