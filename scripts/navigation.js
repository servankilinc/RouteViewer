import * as turf from "@turf/turf";

let graph = { nodes: [], edges: [] };
let adjacencyList = [];


export const Navigation = (startId, targetId) => {

    // Sıralama: findIntersections => setNodes => setEdges => setAdjacencies
    findIntersections(paths);
    setNodes();
    setEdges();
    setAdjacencies();
  
    const startPoly = polygons.find(p => p.id == startId);
    const endPoly = polygons.find(p => p.id == targetId);
    const start = startPoly.properties.entrance.coordinates;
    const end =endPoly.properties.entrance.coordinates;
    const nearestNodeToStart = findNearestNode(start);
    const nearestNodeToEnd = findNearestNode(end);
  
    drawnItemsRoute.addLayer(L.marker([nearestNodeToStart.coordinate[1], nearestNodeToStart.coordinate[0]]));
    drawnItemsRoute.addLayer(L.marker([nearestNodeToEnd.coordinate[1], nearestNodeToEnd.coordinate[0]]));
  
    console.log("NODES => ", graph.nodes);
    console.log("Edges  => ", graph.edges);
    console.log("ADJACENCYLIST =>", adjacencyList);
  
    var result = findShortestPath(adjacencyList, nearestNodeToStart.id, nearestNodeToEnd.id);
    console.log("result = ", result);
    var cords = result.path.map((nId) => graph.nodes.find((n) => n.id == nId));
    var seg = turf.lineString(cords.map((t) => t.coordinate));
    let drawedRoute = L.geoJSON(seg, {
      color: "red",
      weight: 4,
      fillOpacity: 0.5,
      opacity: 0.5,
    })
    drawnItemsRoute.addLayer( drawedRoute)
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
            var isExist_interceptedNodePath1 = coordinateListPath1.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);
            var isExist_interceptedNodePath2 = coordinateListPath2.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);
  
            var _continue = true;
            if (!isExist_interceptedNodePath1 || !isExist_interceptedNodePath2) {
              for (let k = 0; _continue && k < coordinateListPath1.length - 1; k++) {
                for (let m = 0; _continue && m < coordinateListPath2.length - 1; m++) {
  
                  const segment1 = turf.lineString([coordinateListPath1[k], coordinateListPath1[k + 1]]);
                  const segment2 = turf.lineString([coordinateListPath2[m], coordinateListPath2[m + 1]]);
  
                  const intersectSegment = turf.lineIntersect(segment1, segment2);
  
                  // segmentler arasında kesişim var mı
                  if (intersectSegment.features.length > 0) {
                    if (!isExist_interceptedNodePath1) {
                      coordinateListPath1.splice(k + 1, 0, cordinate);
                    }
                    if (!isExist_interceptedNodePath2) {
                      coordinateListPath2.splice(m + 1, 0, cordinate);
                    }
                    L.circle([cordinate[1], cordinate[0]], {
                      color: "#000",
                      fillColor: "#f03",
                      fillOpacity: 0.5,
                      radius: 5,
                    }).addTo(map).bindPopup("I am a circle.");
                    _continue = false;
                  }
                }
              }
            }
          })
        }
      }
    }
  }
  
  
  // Düğümleri Topla
  function setNodes() {
    if (paths != null && graph.nodes != null && paths.length > 0) {
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        var index = graph.nodes.length-1 + 1;
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
  
  
  
  // Edge kenarlar toplanır
  function setEdges() {
    for (let i = 0; i < paths.length; i++) {
      for (let k = 0; k < paths[i].geometry.coordinates.length - 1; k++) {
        const startCord = paths[i].geometry.coordinates[k];
        const endCord = paths[i].geometry.coordinates[k + 1];
  
        var _continueStart = true;
        var _continueEnd = true;
        var fromId = -1;
        var toId = -1;
        graph.nodes.map((n) => {
          if (_continueStart && n.coordinate[0] == startCord[0] && n.coordinate[1] == startCord[1]) {
            fromId = n.id;
            _continueStart = false;
          }
          if (_continueEnd && n.coordinate[0] == endCord[0] && n.coordinate[1] == endCord[1]) {
            toId = n.id;
            _continueEnd = false;
          }
        });
        var distance = turf.distance(turf.point(startCord), turf.point(endCord));
        graph.edges.push({
          from: fromId,
          to: toId,
          weight: distance,
        });
      }
    }
  }
  
  
  // Komşulukları topla
  function setAdjacencies() {
    graph.edges.map((e) => {
      let isExist = adjacencyList.some((data) => (data.node1 == e.from || data.node2 == e.from) && (data.node1 == e.to || data.node2 == e.to));
      if (!isExist) {
        if (!adjacencyList[e.from]) {
          adjacencyList[e.from] = [];
        }
        if (!adjacencyList[e.to]) {
          adjacencyList[e.to] = [];
        }
  
        adjacencyList[e.from].push({
          node: e.to,
          weight: e.weight,
        });
        adjacencyList[e.to].push({
          node: e.from,
          weight: e.weight,
        });
      }
    });
  }
  
  
  
  // Todo: En yakın node yerine en yakın yola en yakın konum düğüm gibi geçirilmeli
  function findNearestNode(point) {
    let nearestNode = null;
    let minDistance = Infinity;
    graph.nodes.map((n) => {
      const dist = turf.distance(turf.point(point), turf.point(n.coordinate), {units: "meters"});
      if (dist < minDistance) {
        nearestNode = n;
        minDistance = dist;
      }
    });
    return nearestNode;
  }
  
  
  // Dijkstra algoritması
  function findShortestPath(adjacencyList, startId, targetId) {
    const distances = {};
    const previousNodes = {};
    const unvisited = new Set(Object.keys(adjacencyList));
  
    // Başlangıç mesafelerini ayarla
    Object.keys(adjacencyList).forEach((node) => {distances[node] = Infinity;});
    distances[startId] = 0;
  
    while (unvisited.size > 0) {
      // En kısa mesafeli düğümü bul
      const currentNode = Array.from(unvisited).reduce((closest, nodeId) => {
        return distances[nodeId] < distances[closest] ? nodeId : closest;
      });
  
      // Eğer hedef düğüme ulaşıldıysa
      if (currentNode === targetId) {
        break;
      }
  
      unvisited.delete(currentNode);
      // Komşuları kontrol et
      adjacencyList[currentNode].forEach(({ node, weight }) => {
        const newDist = distances[currentNode] + weight;
        if (newDist < distances[node]) {
          distances[node] = newDist;
          previousNodes[node] = currentNode;
        }
      });
    }
  
    // En kısa yolu oluştur
    const path = [];
    let currentNode = targetId;
    while (currentNode !== undefined) {
      path.unshift(currentNode.toString());
      currentNode = previousNodes[currentNode];
    }
  
    return { path, distance: distances[targetId] };
  }