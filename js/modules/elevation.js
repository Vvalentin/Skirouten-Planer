export class ElevationService {
    constructor(url) {
        this.url = url;
        this.raster = null;
        this.width = 0;
        this.height = 0;
        this.bbox = null;
        this.isLoaded = false;
    }

    async load() {
        try {
            const res = await fetch(this.url);
            if (!res.ok) throw new Error(`Datei fehlt: ${this.url}`);
            
            const buffer = await res.arrayBuffer();
            // Zugriff auf globales GeoTIFF Objekt
            const tiff = await GeoTIFF.fromArrayBuffer(buffer);
            const image = await tiff.getImage();
            
            this.raster = (await image.readRasters())[0];
            this.width = image.getWidth();
            this.height = image.getHeight();
            this.bbox = image.getBoundingBox();
            this.isLoaded = true;
            
            console.log('SRTM geladen:', { w: this.width });
            return true;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    getElevation(lat, lng) {
        if (!this.isLoaded) return 0;
        
        const [minX, minY, maxX, maxY] = this.bbox;
        if (lng < minX || lng > maxX || lat < minY || lat > maxY) return 0;

        const x = Math.floor(((lng - minX) / (maxX - minX)) * this.width);
        const y = Math.floor(((maxY - lat) / (maxY - minY)) * this.height);
        
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
        
        const val = this.raster[y * this.width + x];
        // Filter für No-Data Werte (oft -32768)
        return (val === -32768 || !isFinite(val)) ? 0 : val;
    }
}