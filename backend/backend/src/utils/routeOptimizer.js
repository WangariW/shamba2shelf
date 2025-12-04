console.log("🔧 routeOptimizer.js - Loading...");

function computeOptimalRoute(matrix, farmersCount) {
  const distanceMatrix = matrix.distances;
  const durationMatrix = matrix.durations;

  const buyerIndex = farmersCount;

  const unvisited = Array.from({ length: farmersCount }, (_, i) => i);
  const route = [];
  let current = buyerIndex;

  let totalDistance = 0;
  let totalDuration = 0;

  while (unvisited.length > 0) {
    let nearest = null;
    let nearestDist = Infinity;

    unvisited.forEach((farmerIndex) => {
      const dist = distanceMatrix[current][farmerIndex];
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = farmerIndex;
      }
    });

    route.push(nearest);
    totalDistance += distanceMatrix[current][nearest];
    totalDuration += durationMatrix[current][nearest];

    current = nearest;
    unvisited.splice(unvisited.indexOf(nearest), 1);
  }

  return { route, totalDistance, totalDuration };
}
console.log("✅ routeOptimizer.js - Function exported");

module.exports = computeOptimalRoute;
