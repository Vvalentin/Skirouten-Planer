import { CONFIG, ICONS_DEF } from './config.js';
import { UIUtils } from './utils.js';

export class MapManager {
    constructor(mapId, videoPlayer) {
        this.map = L.map(mapId).setView(CONFIG.START_VIEW, CONFIG.ZOOM);
        this.videoPlayer = videoPlayer;
        this.specialLayers = [];
        this.markingActive = false;
        
        this._initBaseLayers();
        this._initContextMenu();
    }

    _initBaseLayers() {
        const osm = L.tileLayer(CONFIG.TILE_LAYERS.osm.url, { maxZoom: 19, attribution: CONFIG.TILE_LAYERS.osm.attr }).addTo(this.map);
        const topo = L.tileLayer(CONFIG.TILE_LAYERS.topo.url, { maxZoom: 17, attribution: CONFIG.TILE_LAYERS.topo.attr });
        const pistes = L.tileLayer(CONFIG.TILE_LAYERS.pistes.url, { maxZoom: 18, opacity: 0.8, attribution: CONFIG.TILE_LAYERS.pistes.attr });

        this.baseMaps = { "Standard Karte": osm, "Topographisch": topo };
        this.overlayMaps = { "Pisten Overlay": pistes };
    }

    _initContextMenu() {
        this.map.on('contextmenu', (e) => {
            const coordString = `[${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}]`;
            console.log("Koordinate kopiert:", coordString);
            alert("Koordinate: " + coordString); // Optional
        });
    }

    addPoiLayer(name, data, typeKey, defaultText) {
        const typeInfo = ICONS_DEF[typeKey];
        
        const markerArray = data.map(item => {
            let coords, videoFile, customText;

            if (Array.isArray(item)) {
                coords = item;
            } else {
                coords = item.coords;
                videoFile = item.video;
                customText = item.desc;
            }

            const icon = UIUtils.createEmojiIcon(typeInfo.emoji, typeInfo.color, !!videoFile);
            const marker = L.marker(coords, {icon: icon});

            if (videoFile) {
                marker.on('click', () => {
                    // WICHTIG: Video nur öffnen, wenn wir NICHT zeichnen
                    if (!this.markingActive) {
                        this.videoPlayer.open(videoFile);
                    }
                });
                marker.bindTooltip("▶ Video ansehen", { direction: 'top', offset: [0, -15] });
            } else {
                marker.bindPopup(customText || defaultText);
            }
            return marker;
        });

        const layerGroup = L.layerGroup(markerArray); // .addTo(this.map) optional hier
        this.specialLayers.push(layerGroup);
        this.overlayMaps[name] = layerGroup;
        
        return layerGroup;
    }

    initLayerControl() {
        L.control.layers(this.baseMaps, this.overlayMaps, { collapsed: false }).addTo(this.map);
    }

    // Steuert, ob Marker klickbar sind (für Routing-Modus)
    setMarkersInteractive(isInteractive) {
        this.markingActive = !isInteractive;
        this.specialLayers.forEach(layerGroup => {
            layerGroup.eachLayer(marker => {
                const element = marker.getElement();
                if (element) {
                    element.style.pointerEvents = isInteractive ? 'auto' : 'none';
                }
            });
        });
    }
    
    getMap() { return this.map; }
}