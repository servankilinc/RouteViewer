import * as turf from "@turf/turf";
import { Graph } from "graphlib";
import { alg } from "graphlib";

let graph = { nodes: [], edges: [] };

export const Navigation = (startId, targetId) => {
  findIntersections(paths);
  setNodes(); 
  paths.forEach((road) => {
    const coordinates = road.geometry.coordinates;

    for (let i = 0; i < coordinates.length - 1; i++) {
      const source = JSON.stringify(coordinates[i]);
      const target = JSON.stringify(coordinates[i + 1]);

      const distance = turf.distance(
        turf.point(coordinates[i]),
        turf.point(coordinates[i + 1])
      );
      graph.edges.push({ source, target, weight: distance });
      graph.edges.push({ source: target, target: source, weight: distance }); // Çift yönlü bağlantı
    }
  });

  // Graf düğümlerini ve kenarlarını oluştur
  const graph2 = new Graph();
  graph.edges.forEach((edge) => {
    graph2.setNode(edge.source);
    graph2.setNode(edge.target);
    graph2.setEdge(edge.source, edge.target, edge.weight); // Ağırlık ekleniyor
  });

  // En kısa yolu bulma
  function findShortestPath(start, end) {
    const path = alg.dijkstra(graph2, start);
    const route = [];
    let current = end;

    while (current !== start) {
      if (!path[current].predecessor) {
        throw new Error("Hedefe ulaşmak mümkün değil!");
      }
      route.unshift(current);
      current = path[current].predecessor;
    }

    route.unshift(start);
    return { route, distance: path[end].distance };
  }

  const startPoly = polygons.find((p) => p.id == startId);
  const endPoly = polygons.find((p) => p.id == targetId);
  const start = startPoly.properties.entrance.coordinates;
  const end = endPoly.properties.entrance.coordinates;
  const nearestNodeToStart = findNearestNode(start);
  const nearestNodeToEnd = findNearestNode(end);
  const startNode = JSON.stringify(nearestNodeToStart.coordinate);
  const endNode = JSON.stringify(nearestNodeToEnd.coordinate);
  //   console.log("StartNode  :", startNode);
  //   console.log("EndNode :", endNode);
  //   console.log("Tüm düğümler:", Object.keys(graph2._nodes));
  //   console.log("StartNode graf'ta var mı?:", graph2.hasNode(startNode));
  //   console.log("EndNode graf'ta var mı?:", graph2.hasNode(endNode));
  //   console.log("StartNode'dan çıkan kenarlar:", graph2.outEdges(startNode));
  // console.log("EndNode'ya giren kenarlar:", graph2.inEdges(endNode));

  drawnItemsRoute.addLayer(
    L.marker([
      nearestNodeToStart.coordinate[1],
      nearestNodeToStart.coordinate[0],
    ])
  );
  drawnItemsRoute.addLayer(
    L.marker([nearestNodeToEnd.coordinate[1], nearestNodeToEnd.coordinate[0]])
  );

  try {
    const shortestPath = findShortestPath(startNode, endNode);
    console.log("En Kısa Yol:", shortestPath);
    var route = shortestPath.route.map((i) => JSON.parse(i));
    drawnItemsRoute.addLayer(
      L.polyline([route.map(([lon, lat]) => [lat, lon])], {
        color: "red",
      })
    );
  } catch (error) {
    alert(error.message);
  }
};

// kesişimleri pathlere ekle
function findIntersections(_pathList) {
  for (let i = 0; i < _pathList.length; i++) {
    for (let j = i == 0 ? 1 : 0; i != j && j < _pathList.length; j++) {
      const path1 = _pathList[i];
      const path2 = _pathList[j];

      const line1 = turf.lineString(path1.geometry.coordinates);
      const line2 = turf.lineString(path2.geometry.coordinates);

      // İki lineString arasındaki kesişim noktalarını bul
      const intersect = turf.lineIntersect(line1, line2);

      // Kesişim varsa detaylı, segment segment kontrol edilebilir
      if (intersect.features.length > 0) {
        intersect.features.forEach((feature) => {
          var cordinate = feature.geometry.coordinates;

          var coordinateListPath1 = path1.geometry.coordinates;
          var coordinateListPath2 = path2.geometry.coordinates;
          // her iki yol için bu enlem boylama sahip düğüm yoksa ekle
          var isExist_interceptedNodePath1 = coordinateListPath1.some(
            (c) => c[0] == cordinate[0] && c[1] == cordinate[1]
          );
          var isExist_interceptedNodePath2 = coordinateListPath2.some(
            (c) => c[0] == cordinate[0] && c[1] == cordinate[1]
          );

          var _continue = true;
          if (!isExist_interceptedNodePath1 || !isExist_interceptedNodePath2) {
            for (
              let k = 0;
              _continue && k < coordinateListPath1.length - 1;
              k++
            ) {
              for (
                let m = 0;
                _continue && m < coordinateListPath2.length - 1;
                m++
              ) {
                const segment1 = turf.lineString([
                  coordinateListPath1[k],
                  coordinateListPath1[k + 1],
                ]);
                const segment2 = turf.lineString([
                  coordinateListPath2[m],
                  coordinateListPath2[m + 1],
                ]);

                const intersectSegment = turf.lineIntersect(segment1, segment2);

                // segmentler arasında kesişim var mı
                if (intersectSegment.features.length > 0) {
                  if (!isExist_interceptedNodePath1) {
                    coordinateListPath1.splice(k + 1, 0, cordinate);
                  }
                  if (!isExist_interceptedNodePath2) {
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
        });
      }
    }
  }
}

// Düğümleri Topla
function setNodes() {
  if (paths != null && graph.nodes != null && paths.length > 0) {
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      var index = graph.nodes.length - 1 + 1;
      path.geometry.coordinates.map((cord) => {
        // düğümler tekrarlamasın diye
        if (
          graph.nodes.length == 0 ||
          !graph.nodes.some(
            (n) => n.coordinate[0] == cord[0] && n.coordinate[1] == cord[1]
          )
        ) {
          graph.nodes.push({
            id: index,
            coordinate: cord,
          });
          index += 1;
        }
      });
    }
  }
}

// Todo: En yakın node yerine en yakın yola en yakın konum düğüm gibi geçirilmeli
function findNearestNode(point) {
  let nearestNode = null;
  let minDistance = Infinity;
  graph.nodes.map((n) => {
    const dist = turf.distance(turf.point(point), turf.point(n.coordinate), {
      units: "meters",
    });
    if (dist < minDistance) {
      nearestNode = n;
      minDistance = dist;
    }
  });
  return nearestNode;
}
