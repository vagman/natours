/* eslint-disable */
import L from 'leaflet';

const displayMap = locations => {
  let map = L.map('map', {
    zoomControl: false,
    attributionControl: false, // Disable default attribution
  });

  // Add custom attribution control on the left
  L.control
    .attribution({
      position: 'bottomleft', // Position on bottom-left
    })
    .addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const points = [];
  locations.forEach(loc => {
    points.push([loc.coordinates[1], loc.coordinates[0]]);
    L.marker([loc.coordinates[1], loc.coordinates[0]])
      .addTo(map)
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        autoClose: false,
      });
  });

  // For tighter bounds (less padding around markers)
  const bounds = L.latLngBounds(points).pad(1.0);

  // Start zoomed out
  map.setView([0, 0], 1);

  // Single smooth zoom animation
  setTimeout(() => {
    map.flyToBounds(bounds, {
      animate: true,
      duration: 3, // 3 seconds for smooth animation
      easeLinearity: 0.1,
    });

    // Open popups after animation completes
    setTimeout(() => {
      map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          layer.openPopup();
        }
      });
    }, 3200); // Wait for animation to finish
  }, 800);

  map.scrollWheelZoom.disable();
};

export default displayMap;
