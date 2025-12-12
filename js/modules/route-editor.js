export class RouteEditor {
    constructor(mapManager, elevationService, chartService) {
        this.mapManager = mapManager;
        this.map = mapManager.getMap();
        this.srtm = elevationService;
        this.chart = chartService;

        this.currentPoints = [];
        this.globalRouteCoords = [];
        this.isDrawing = false;

        // Layer für die Linie und Punkte
        this.routeLayer = L.polyline([], { color: 'red', weight: 4 }).addTo(this.map);
        this.markerGroup = L.layerGroup().addTo(this.map);
        
        // Hover Marker für Diagramm
        this.hoverMarker = L.circleMarker([0,0], {
            radius: 7, color: 'black', fillColor: 'yellow', fillOpacity: 1, weight: 2
        }).addTo(this.map);
        this.hoverMarker.setStyle({ opacity: 0, fillOpacity: 0 });

        this._initMapEvents();
    }

    _initMapEvents() {
        this.map.on('click', e => {
            if (!this.isDrawing) return;
            this.addPoint(e.latlng);
        });
    }

    toggleDrawing() {
        this.isDrawing = !this.isDrawing;
        
        // Sag dem MapManager, er soll Marker deaktivieren, damit wir nicht versehentlich klicken
        this.mapManager.setMarkersInteractive(!this.isDrawing);

        if (this.isDrawing) {
            this.reset();
        } else {
            this._calculateRoute();
        }
        return this.isDrawing;
    }

    addPoint(latlng) {
        this.currentPoints.push(latlng);
        L.marker(latlng).addTo(this.markerGroup);
    }

    undo() {
        if (!this.currentPoints.length) return;
        this.currentPoints.pop();
        // Entferne letzten Marker
        const layers = this.markerGroup.getLayers();
        if (layers.length) {
            this.markerGroup.removeLayer(layers[layers.length - 1]);
        }
    }

    reset() {
        this.currentPoints = [];
        this.globalRouteCoords = [];
        this.markerGroup.clearLayers();
        this.routeLayer.setLatLngs([]);
        this.chart.clear();
        this.hoverMarker.setStyle({ opacity: 0, fillOpacity: 0 });
    }

    _calculateRoute() {
        if (this.currentPoints.length < 2) return;
        
        const fullRoute = [];
        let totalDist = 0;

        for (let i = 0; i < this.currentPoints.length - 1; i++) {
            const p1 = this.currentPoints[i];
            const p2 = this.currentPoints[i+1];
            const segmentDist = this.map.distance(p1, p2);
            const steps = Math.max(5, Math.floor(segmentDist / 5)); // alle ~20m ein Punkt

            for (let j = 0; j <= steps; j++) {
                if (i > 0 && j === 0) continue; // Duplikate vermeiden
                
                const t = j / steps;
                const lat = p1.lat + (p2.lat - p1.lat) * t;
                const lng = p1.lng + (p2.lng - p1.lng) * t;
                
                let h = this.srtm.getElevation(lat, lng);
                // Fallback wenn h=0 und wir schon Daten haben (kleiner Glättungsversuch)
                if (h === 0 && fullRoute.length > 0) h = fullRoute[fullRoute.length - 1].elev;

                if (fullRoute.length > 0) {
                    const prev = fullRoute[fullRoute.length - 1];
                    totalDist += this.map.distance(L.latLng(prev.lat, prev.lng), L.latLng(lat, lng));
                }
                fullRoute.push({ lat, lng, elev: h, dist: totalDist });
            }
        }

        this.globalRouteCoords = fullRoute;
        this.routeLayer.setLatLngs(fullRoute.map(p => [p.lat, p.lng]));
        this.map.fitBounds(this.routeLayer.getBounds(), { padding: [50, 50] });
        
        // Chart updaten
        this.chart.update(fullRoute, (hoverIndex) => this._onChartHover(hoverIndex));
    }

    _onChartHover(index) {
        if (index >= 0 && this.globalRouteCoords[index]) {
            const point = this.globalRouteCoords[index];
            this.hoverMarker.setLatLng([point.lat, point.lng]);
            this.hoverMarker.setStyle({ opacity: 1, fillOpacity: 1 });
        } else {
            this.hoverMarker.setStyle({ opacity: 0, fillOpacity: 0 });
        }
    }
}