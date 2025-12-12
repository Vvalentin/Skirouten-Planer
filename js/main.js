import { CONFIG } from './modules/config.js';
import { LOCATIONS } from './modules/data.js';
import { ElevationService } from './modules/elevation.js';
import { VideoPlayer } from './modules/video.js';
import { MapManager } from './modules/map-manager.js';
import { ElevationChart } from './modules/chart.js';
import { RouteEditor } from './modules/route-editor.js';

// === UI REFERENZEN ===
const infoSpan = document.getElementById('info');
const toggleBtn = document.getElementById('toggleMarking');
const undoBtn = document.getElementById('undoPoint');
const clearBtn = document.getElementById('clearAll');

// === 1. SERVICES STARTEN ===
const videoPlayer = new VideoPlayer();
const srtm = new ElevationService(CONFIG.SRTM_URL);
const chart = new ElevationChart('elevationChart');

// === 2. KARTE & LAYER ===
const mapManager = new MapManager('map', videoPlayer);

// Layer hinzufügen
mapManager.addPoiLayer("⛷️ Naturschanzen", LOCATIONS.naturSchanzen, 'natur', "<b>Naturschanze</b><br>Ready to drop!");
mapManager.addPoiLayer("⛏️ Bau-Spots",     LOCATIONS.bauSpots,      'bau',   "<b>Bau-Spot</b><br>Schaufel nötig.");
mapManager.addPoiLayer("❄️ Wächten",       LOCATIONS.waechten,      'waechte',"<b>Vorsicht Wächte!</b><br>Abbruchkante beachten.");
mapManager.addPoiLayer("⚠️ Gefahren",      LOCATIONS.gefahren,      'gefahr', "<b>Gefahrenstelle!</b><br>Bitte langsam fahren.");

// Layer Control aktivieren (nachdem alle Layer hinzugefügt wurden)
mapManager.initLayerControl();

// === 3. ROUTEN EDITOR ===
const routeEditor = new RouteEditor(mapManager, srtm, chart);

// === 4. DATEN LADEN & START ===
async function initApp() {
    try {
        infoSpan.textContent = 'Lade Höhendaten...';
        await srtm.load();
        
        infoSpan.innerHTML = '<span class="success">✓ System bereit</span>';
        toggleBtn.disabled = false;
        toggleBtn.textContent = 'Route zeichnen';
        
    } catch (err) {
        infoSpan.innerHTML = `<span class="error">${err.message}</span>`;
    }
}

// === 5. BUTTON EVENTS ===
toggleBtn.onclick = () => {
    const isDrawing = routeEditor.toggleDrawing();
    
    toggleBtn.textContent = isDrawing ? 'Fertigstellen' : 'Neue Route';
    toggleBtn.style.background = isDrawing ? '#d9534f' : '#0078D7'; 
};

undoBtn.onclick = () => routeEditor.undo();
clearBtn.onclick = () => routeEditor.reset();

// Start
initApp();