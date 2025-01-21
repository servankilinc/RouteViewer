import * as turf from "@turf/turf";
import { Graph } from "graphlib";
import { alg } from "graphlib";
import { sync_path_UI } from "./syncUI";
import { graphList } from "./app";


// let graph = new Graph();
// window.graph = graph;

export function Navigation(startPolyId, targetPolyId, floor)
{
  console.log("NAVİGATE => ",startPolyId, targetPolyId, floor)
  FindIntersections();
  CreateGraphList();

  const nearestNodeToStart = FindNearestNode(startPolyId);
  const nearestNodeToEnd = FindNearestNode(targetPolyId);

  // drawnItemsRoute.addLayer(
  //   L.marker([nearestNodeToStart.coordinate[1], nearestNodeToStart.coordinate[0]])
  // );
  // drawnItemsRoute.addLayer(
  //   L.marker([nearestNodeToEnd.coordinate[1], nearestNodeToEnd.coordinate[0]])
  // );

  try {
    const shortestPath = FindShortestPath(nearestNodeToStart.coordinate, nearestNodeToEnd.coordinate, floor);
    console.log("En Kisa Yol:", shortestPath);
    var route = shortestPath.route.map((i) => JSON.parse(i));
    drawnItemsRoute.addLayer(
      L.polyline([route.map(([lon, lat]) => [lat, lon])], {
        color: "orange",
      })
    );
  }   
  catch (error) {
    alert(error.message);
  }
};


function FindShortestPath(startCordinate, targetCordinate, floor) 
{
  console.log("**** startCordinate, targetCordinate, floor => ", startCordinate, targetCordinate, floor)

  const startCord = JSON.stringify(startCordinate);
  const targetCord = JSON.stringify(targetCordinate);
  const graphData = graphList.find(f => f.floor == floor); 
  console.log("**** graphData.graphGraphLib() => ", floor,graphData.graphGraphLib)
  const path = alg.dijkstra(graphData.graphGraphLib, startCord);
  console.log("**** PATH => ", path)
  const route = [];
  let current = targetCord;

  while (current !== startCord) {
    console.log("**** CURENT => ", current)
    if (!path[current].predecessor) {
      throw new Error("Hedefe ulaşmak mümkün değil!");  
    }
    route.unshift(current);
    current = path[current].predecessor;
  }

  route.unshift(startCord);
  return { route, distance: path[targetCord].distance };
}


function CreateGraphList()
{
  // Todo:
  // graph yapıları kat bazlı yapılmalı
  // önemli noktalar da path sistemine eklenmeli

  graphList.map(graphData => {
    var floorPaths = paths.filter(f => f.floor == graphData.floor);

    if (floorPaths == null || graphData.nodes == null) { return; }
  
    // set nodes
    for (let i = 0; i < paths.length; i++) 
    {
      const path = paths[i];
      var index = graphData.nodes.length;
      path.geometry.coordinates.map((cord) => {
        var isExist = graphData.nodes.some((n) => n.coordinate[0] == cord[0] && n.coordinate[1] == cord[1]);
        if (isExist == false)
        {
          graphData.nodes.push({
            id: index,
            coordinate: cord,
          });
          index += 1;
        }
      });
    }

    // set edges
    paths.forEach((road) => {
      const coordinates = road.geometry.coordinates;
      for (let i = 0; i < coordinates.length - 1; i++)
      {
        const source = JSON.stringify(coordinates[i]);
        const target = JSON.stringify(coordinates[i + 1]);
  
        const distance = turf.distance(
          turf.point(coordinates[i]),
          turf.point(coordinates[i + 1])
        );
        graphData.edges.push({ source: source, target: target, weight: distance });
        graphData.edges.push({ source: target, target: source, weight: distance }); // Çift yönlü bağlantı
      }
    });
  
    graphData.edges.forEach((edge) => {
      graphData.graphGraphLib.setNode(edge.source);
      graphData.graphGraphLib.setNode(edge.target);
      graphData.graphGraphLib.setEdge(edge.source, edge.target, edge.weight); // Ağırlık ekleniyor
    }); 
    console.log(" graph.nodes => ", graphData.graphGraphLib.nodes());
  })
}

// Todo: En yakın node yerine en yakın yola en yakın konum düğüm gibi geçirilmeli
function FindNearestNode(pId) {
  var isExist = polygons.some(p => p.id == pId);
  if(isExist == false) { return; }
    
  const relatedPoly = polygons.find(p => p.id == pId);
  const cordinate = relatedPoly.properties.entrance.coordinates;

  let nearestNode = null;
  let minDistance = Infinity;
  
  var floorGraphData = graphList.find(f => f.floor == relatedPoly.floor)
  console.log("FLOOR GRAPH DATA => ", floorGraphData)
  if(floorGraphData == null) { return; }

  floorGraphData.nodes.map((n) => {
    const dist = turf.distance(turf.point(cordinate), turf.point(n.coordinate), {
      units: "meters",
    });
    if (dist < minDistance) {
      nearestNode = n;
      minDistance = dist;
    }
  });
  return nearestNode;
}


// kesişim noktalarını yoll çizgilerine sanki birer node'muş gibi ekler
function FindIntersections() 
{
  paths.map(path1 => {
    var otherPaths = paths.filter(f => path1.floor == f.floor && path1.id != f.id);
    
    console.log("PATH 1 =>", path1);
    console.log("OTHER PATHS =>", otherPaths);
    
    otherPaths.map(path2 => {
      const linePath1 = turf.lineString(path1.geometry.coordinates);
      const linePath2 = turf.lineString(path2.geometry.coordinates);
    
      const intersect = turf.lineIntersect(linePath1, linePath2);
    
      if (intersect.features.length > 0)
      {
        InsertNewNodes(intersect, path1.geometry.coordinates, path2.geometry.coordinates);
      }
      else
      {
        CheckBufferIntersection(path1.geometry.coordinates, path2.geometry.coordinates);
      }
    })
  })

  sync_path_UI();
}


function InsertNewNodes(intersect, coordinateListPath1, coordinateListPath2)
{
  /*
intersect.features.forEach((feature) => {
          var cordinate = feature.geometry.coordinates;

  */

  for (let i = 0; i < intersect.features.length ; i++) {
    var cordinate = intersect.features[i].geometry.coordinates;

    var isExistOnPath1 = coordinateListPath1.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);
    var isExistOnPath2 = coordinateListPath2.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);
    if (isExistOnPath1 == true && isExistOnPath2  == true) { continue; }
    
    var _continue = true;
    for (let k = 0; _continue && k < coordinateListPath1.length - 1; k++) {
      for (let m = 0; _continue && m < coordinateListPath2.length - 1; m++) {
        const segment1 = turf.lineString([coordinateListPath1[k], coordinateListPath1[k + 1]]);
        const segment2 = turf.lineString([coordinateListPath2[m], coordinateListPath2[m + 1]]);
        const intersectSegment = turf.lineIntersect(segment1, segment2);

        // segmentler arasında kesişim var mı
        if (intersectSegment.features.length > 0) {
          if (!isExistOnPath1) {
            coordinateListPath1.splice(k + 1, 0, cordinate);
          }
          if (!isExistOnPath2) {
            coordinateListPath2.splice(m + 1, 0, cordinate);
          }
          
          drawnItemsRoute.addLayer(
            L.circle([cordinate[1], cordinate[0]], {
              color: "#000",
              fillColor: "#f03",
              fillOpacity: 0.5,
              radius: 5,
            })
          );

          _continue = false;
        }
      }
    }
  } 
}

// ***** kesişim olmaması durumunda *****
// 1) tampon bölgeler ile tekrar kesişimi kontrol et
// 2) eğer kesişim olursa kesişimin olduğu segmente kesişim noktası düğüm olarak eklenir
function CheckBufferIntersection(coordinateListPath1, coordinateListPath2) 
{
  const tolerance = 3;

  var _continue = true;
  for (let k = 0; _continue && k < coordinateListPath1.length - 1; k++) {
    for (let m = 0; _continue && m < coordinateListPath2.length - 1; m++) {

      const segment1 = turf.lineString([coordinateListPath1[k], coordinateListPath1[k + 1]]);
      const segment2 = turf.lineString([coordinateListPath2[m], coordinateListPath2[m + 1]]);

      const buffer1 = turf.buffer(segment1, tolerance, { units: "meters" });
      const buffer2 = turf.buffer(segment2, tolerance, { units: "meters" });
      var isInterSect = turf.booleanIntersects(buffer1, buffer2);

      if (isInterSect == false) {continue;}
       
      const intersectPoly = turf.intersect(turf.featureCollection([buffer1, buffer2]));

      if (intersectPoly.geometry.coordinates.length > 0) {

        var med = Math.floor(intersectPoly.geometry.coordinates[0].length / 2);
        var cordinate = intersectPoly.geometry.coordinates[0][med];

        var isExistOnPath1 = coordinateListPath1.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);
        var isExistOnPath2 = coordinateListPath2.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);

        var isFirstSegmentResizing = true; // kesişim noktasına en yakın düğüme sahip segment bulmak için
        var indexNearestNodeToIntersection = null; // kesişim noktasına en yakın düğümün index değeri
        var minDistance = 0;
        for (var x = 0; x < 2; x++) {
          var _dist = turf.distance(turf.point([coordinateListPath1[k + x][0], coordinateListPath1[k + x][1]]), turf.point([cordinate[0], cordinate[1]]));
          if (minDistance == 0 || minDistance > _dist) {
            minDistance = _dist;
            indexNearestNodeToIntersection = k + x;
          }
        }
        for (var x = 0; x < 2; x++) {
          var _dist = turf.distance(turf.point([coordinateListPath2[m + x][0], coordinateListPath2[m + x][1]]), turf.point([cordinate[0], cordinate[1]]));
          if (minDistance == 0 || minDistance > _dist) {
            minDistance = _dist;
            isFirstSegmentResizing = false;
            indexNearestNodeToIntersection = m + x;
          }
        }

        if (!isExistOnPath1) {
          if (isFirstSegmentResizing) {
            // ilk segmentin düğüm noka kordinatı değişmeli
            coordinateListPath1[indexNearestNodeToIntersection] = cordinate;
          }
          else {
            // ilk segmentin arasına kesişim noktası girmeli
            coordinateListPath1.splice(k + 1, 0, cordinate);
          }
        }
        if (!isExistOnPath2) {
          if (isFirstSegmentResizing == false) {
            // ikinci segmentin düğüm noka kordinatı değişmeli
            coordinateListPath2[indexNearestNodeToIntersection] = cordinate;
          }
          else {
            // ikinci segmentin arasına kesişim noktası girmeli
            coordinateListPath2.splice(m + 1, 0, cordinate);
          }
        }

        drawnItemsRoute.addLayer(
          L.circle([cordinate[1], cordinate[0]], {
            color: "#000",
            fillColor: "#f03",
            fillOpacity: 0.5,
            radius: 5,
          })
        );

        _continue = false;
      }
    }
  }
}