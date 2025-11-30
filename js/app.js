// === KONFIGURATION ===
const SRTM_URL = 'srtm/47_10.tif'; 

// === KARTE INITIALISIEREN ===
const map = L.map('map').setView([47.2540, 10.1348], 14);

// Basis-Layer
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19, attribution: '© OpenStreetMap'
}).addTo(map);

const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Kartendaten: © OpenStreetMap, SRTM | OpenTopoMap (CC-BY-SA)'
});

const pistesLayer = L.tileLayer('https://tiles.opensnowmap.org/pistes/{z}/{x}/{y}.png', {
  maxZoom: 18, opacity: 0.8, attribution: 'Tiles © opensnowmap.org'
});


// === VIDEO PLAYER LOGIK (Overlay) ===
const overlay = document.getElementById('video-overlay');
const videoPlayer = document.getElementById('fullscreen-player');
const closeBtn = document.getElementById('close-video');

function openVideo(filename) {
    if (!filename) return;
    videoPlayer.src = `videos/${filename}`;
    overlay.classList.remove('overlay-hidden');
    overlay.style.display = 'flex'; 
    videoPlayer.play();
}

function closeVideo() {
    videoPlayer.pause();
    overlay.classList.add('overlay-hidden');
    overlay.style.display = 'none';
    videoPlayer.src = "";
}

// Event-Listener für den Player (falls Elemente im HTML existieren)
if (closeBtn) closeBtn.onclick = closeVideo;
if (overlay) overlay.onclick = (e) => {
    if (e.target === overlay) closeVideo();
};


// === ICONS DEFINIEREN (Update) ===
const createEmojiIcon = (emoji, color, hasVideo) => {
    const playBadge = hasVideo ? '<div class="play-badge">▶</div>' : '';
    
    return L.divIcon({
        className: 'emoji-icon', 
        html: `
            <div class="emoji-icon-wrapper">
                <div class="emoji-content" style="color: ${color || 'black'};">${emoji}</div>
                ${playBadge}
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
};

// Definitionen der Typen
const iconsDef = {
    natur:  { emoji: '⛷️', color: '#0078D7' },
    bau:    { emoji: '⛏️', color: '#F57C00' },
    waechte:{ emoji: '❄️', color: '#00BCD4' },
    gefahr: { emoji: '⚠️', color: '#D32F2F' }
};


// === DATEN & KOORDINATEN ===

// 1. Naturschanzen
const naturSchanzenDaten = [
    [47.2586, 10.1336],
    [47.2575, 10.1341],
    {coords:[47.2616, 10.1309], video: 'kuchel-backy.MOV', desc: 'Ochsenkopf Backflip' },
    [47.2588, 10.1289],
    [47.2585, 10.1283],
];

// 2. Bau-Spots
const bauSchanzenDaten = [
    { coords: [47.2573, 10.1335] }, 
    { coords: [47.2607, 10.1254] },
    { coords: [47.2619, 10.1266], video: 'ochsenkopf-unten-backy.MP4', desc: 'Ochsenkopf Backflip' },
    { coords: [47.2579, 10.1272] },
];

// 3. Wächten
const waechtenDaten = [
    [47.2598, 10.1318],
    [47.2551, 10.1318]
];

// 4. Gefahrenstellen
const gefahrenDaten = [
    [47.2587, 10.1268] 
];


// === LAYER GRUPPEN ERSTELLEN ===
function createLayerGroup(daten, typeInfo, defaultText) {
    const markerArray = daten.map(item => {
        let coords, videoFile, customText;

        // Normalisierung: Array [lat,lng] vs Objekt {coords, video}
        if (Array.isArray(item)) {
            coords = item;
            videoFile = null;
            customText = null;
        } else {
            coords = item.coords;
            videoFile = item.video;
            customText = item.desc;
        }

        // Icon erstellen (Play-Badge anzeigen wenn videoFile existiert)
        const icon = createEmojiIcon(typeInfo.emoji, typeInfo.color, !!videoFile);
        const marker = L.marker(coords, {icon: icon});

        if (videoFile) {
            // A) MIT VIDEO: Klick öffnet Vollbild
            marker.on('click', () => {
                // Video nur öffnen, wenn wir NICHT zeichnen
                if (!markingActive) {
                    openVideo(videoFile);
                }
            });
            marker.bindTooltip("▶ Video ansehen", { direction: 'top', offset: [0, -15] });
        } else {
            // B) OHNE VIDEO: Standard Popup
            marker.bindPopup(customText || defaultText);
        }

        return marker;
    });
    
    return L.layerGroup(markerArray);
}

// Layer initialisieren
const naturSchanzenLayer = createLayerGroup(naturSchanzenDaten, iconsDef.natur, "<b>Naturschanze</b><br>Ready to drop!");
const bauSchanzenLayer   = createLayerGroup(bauSchanzenDaten, iconsDef.bau, "<b>Bau-Spot</b><br>Schaufel nötig.");
const waechtenLayer      = createLayerGroup(waechtenDaten, iconsDef.waechte, "<b>Vorsicht Wächte!</b><br>Abbruchkante beachten.");
const gefahrenLayer      = createLayerGroup(gefahrenDaten, iconsDef.gefahr, "<b>Gefahrenstelle!</b><br>Bitte langsam fahren.");


// === INTERAKTIVITÄT STEUERN (Click-Through-Fix) ===
const allSpecialLayers = [naturSchanzenLayer, bauSchanzenLayer, waechtenLayer, gefahrenLayer];

function setMarkersClickable(isClickable) {
  allSpecialLayers.forEach(layerGroup => {
    layerGroup.eachLayer(marker => {
      const element = marker.getElement();
      if (element) {
        // 'none' = Klicks gehen durch (Zeichnen) | 'auto' = Klicks treffen Icon (Video/Popup)
        element.style.pointerEvents = isClickable ? 'auto' : 'none';
      }
    });
  });
}


// === LAYER CONTROL (MENÜ) ===
const baseMaps = { 
  "Standard Karte": osmLayer,
  "Topographisch": topoLayer 
};

const overlayMaps = { 
  "Pisten Overlay": pistesLayer,
  "⛷️ Naturschanzen": naturSchanzenLayer,
  "⛏️ Bau-Spots": bauSchanzenLayer,
  "❄️ Wächten": waechtenLayer,
  "⚠️ Gefahren": gefahrenLayer
};

L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

// Standard Layer aktivieren
//naturSchanzenLayer.addTo(map);
//bauSchanzenLayer.addTo(map);


// === ROUTING & CHART LOGIK ===
const routeLayer = L.polyline([], { color: 'red', weight: 4 }).addTo(map);
const markerGroup = L.layerGroup().addTo(map);

const hoverMarker = L.circleMarker([0,0], {
  radius: 7, color: 'black', fillColor: 'yellow', fillOpacity: 1, weight: 2
}).addTo(map);
hoverMarker.setStyle({ opacity: 0, fillOpacity: 0 }); 

let chartInstance = null;
let globalRouteCoords = []; 
let srtmRaster = null, srtmWidth = 0, srtmHeight = 0, srtmBBox = null, srtmLoaded = false;
let currentPoints = [];
let markingActive = false; // Status Variable

// === SRTM LADEN ===
async function loadSRTM() {
  const infoSpan = document.getElementById('info');
  const toggleBtn = document.getElementById('toggleMarking');
  
  try {
    infoSpan.textContent = 'Lade Höhendaten...';
    const res = await fetch(SRTM_URL);
    if (!res.ok) throw new Error(`Datei fehlt: ${SRTM_URL}`);
    
    const buffer = await res.arrayBuffer();
    const tiff = await GeoTIFF.fromArrayBuffer(buffer);
    const image = await tiff.getImage();
    
    srtmRaster = (await image.readRasters())[0];
    srtmWidth = image.getWidth();
    srtmHeight = image.getHeight();
    srtmBBox = image.getBoundingBox();
    srtmLoaded = true;

    console.log('SRTM Ready:', { w: srtmWidth });
    infoSpan.innerHTML = '<span class="success">✓ SRTM & Karten bereit</span>';
    toggleBtn.disabled = false;
    toggleBtn.textContent = 'Route zeichnen';
  } catch (err) {
    console.error(err);
    infoSpan.innerHTML = `<span class="error">${err.message}</span>`;
  }
}
loadSRTM();

// === HELPER FUNKTIONEN ===
function getElevation(lat, lng) {
  if (!srtmLoaded) return 0;
  const [minX, minY, maxX, maxY] = srtmBBox;
  if (lng < minX || lng > maxX || lat < minY || lat > maxY) return 0;

  const x = Math.floor(((lng - minX) / (maxX - minX)) * srtmWidth);
  const y = Math.floor(((maxY - lat) / (maxY - minY)) * srtmHeight);
  
  if (x < 0 || x >= srtmWidth || y < 0 || y >= srtmHeight) return 0;
  
  const val = srtmRaster[y * srtmWidth + x];
  return (val === -32768 || !isFinite(val)) ? 0 : val;
}

function updateChart(routeData) {
  const ctx = document.getElementById('elevationChart').getContext('2d');
  const labels = routeData.map(d => Math.round(d.dist));
  const elevations = routeData.map(d => d.elev);

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Höhe (m)',
        data: elevations,
        borderColor: '#D32F2F', backgroundColor: 'rgba(211, 47, 47, 0.2)',
        borderWidth: 2, pointRadius: 0, 
        pointHoverRadius: 6, pointHoverBackgroundColor: 'yellow', pointHoverBorderColor: 'black',
        fill: true, tension: 0.1
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          callbacks: {
            title: (items) => `Distanz: ${items[0].label} m`,
            label: (ctx) => `Höhe: ${ctx.raw} m`
          }
        }
      },
      scales: {
        x: { display: true, title: { display: true, text: 'Distanz (m)' }, ticks: { maxTicksLimit: 10 } },
        y: { display: true, title: { display: true, text: 'Höhe (m)' } }
      },
      onHover: (event, elements) => {
        if (elements && elements.length > 0) {
          const index = elements[0].index;
          const point = globalRouteCoords[index];
          if (point) {
            hoverMarker.setLatLng([point.lat, point.lng]);
            hoverMarker.setStyle({ opacity: 1, fillOpacity: 1 });
          }
        } else {
          hoverMarker.setStyle({ opacity: 0, fillOpacity: 0 });
        }
      }
    }
  });
}

function interpolateAndBuild() {
  if (currentPoints.length < 2) return;
  const fullRoute = [];
  let totalDist = 0;
  
  for (let i = 0; i < currentPoints.length - 1; i++) {
    const p1 = currentPoints[i], p2 = currentPoints[i+1];
    const segmentDist = map.distance(p1, p2);
    const steps = Math.max(5, Math.floor(segmentDist / 20));
    
    for (let j = 0; j <= steps; j++) {
      if (i > 0 && j === 0) continue; 
      const t = j / steps;
      const lat = p1.lat + (p2.lat - p1.lat) * t;
      const lng = p1.lng + (p2.lng - p1.lng) * t;
      
      let h = getElevation(lat, lng);
      if (h === 0 && fullRoute.length > 0) h = fullRoute[fullRoute.length - 1].elev;

      if (fullRoute.length > 0) {
         const prev = fullRoute[fullRoute.length - 1];
         totalDist += map.distance(L.latLng(prev.lat, prev.lng), L.latLng(lat, lng));
      }
      fullRoute.push({ lat, lng, elev: h, dist: totalDist });
    }
  }
  globalRouteCoords = fullRoute;
  routeLayer.setLatLngs(fullRoute.map(p => [p.lat, p.lng]));
  map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
  updateChart(fullRoute);
}

// === UI EVENTS ===
const toggleBtn = document.getElementById('toggleMarking');

toggleBtn.onclick = () => {
  markingActive = !markingActive;
  toggleBtn.textContent = markingActive ? 'Fertigstellen' : 'Neue Route';
  toggleBtn.style.background = markingActive ? '#d9534f' : '#0078D7'; 
  
  if (markingActive) {
    // START ZEICHNEN -> Marker ignorieren
    setMarkersClickable(false);
    
    currentPoints = [];
    markerGroup.clearLayers();
    routeLayer.setLatLngs([]);
    globalRouteCoords = [];
    if(chartInstance) chartInstance.destroy();
    hoverMarker.setStyle({ opacity: 0, fillOpacity: 0 });

  } else {
    // STOP ZEICHNEN -> Marker wieder aktivieren
    setMarkersClickable(true);
    interpolateAndBuild();
  }
};

document.getElementById('undoPoint').onclick = () => {
  if (!currentPoints.length) return;
  currentPoints.pop();
  markerGroup.removeLayer(markerGroup.getLayers().pop());
};

document.getElementById('clearAll').onclick = () => {
  currentPoints = [];
  markerGroup.clearLayers();
  routeLayer.setLatLngs([]);
  globalRouteCoords = [];
  if(chartInstance) chartInstance.destroy();
  hoverMarker.setStyle({ opacity: 0, fillOpacity: 0 });
};

map.on('click', e => {
  if (!markingActive) return;
  currentPoints.push(e.latlng);
  L.marker(e.latlng).addTo(markerGroup);
});

// === CONTEXT MENU (Rechtsklick) ===
map.on('contextmenu', (e) => {
    const coordString = `[${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}]`;
    console.log("Koordinate kopiert:", coordString);
    alert("Koordinate: " + coordString + "\n(In Konsole F12 kopierbar)");
});