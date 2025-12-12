export const CONFIG = {
    SRTM_URL: 'srtm/47_10.tif',
    START_VIEW: [47.2540, 10.1348],
    ZOOM: 14,
    TILE_LAYERS: {
        osm: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attr: '© OpenStreetMap'
        },
        topo: {
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            attr: 'Kartendaten: © OpenStreetMap, SRTM | OpenTopoMap (CC-BY-SA)'
        },
        pistes: {
            url: 'https://tiles.opensnowmap.org/pistes/{z}/{x}/{y}.png',
            attr: 'Tiles © opensnowmap.org'
        }
    }
};

export const ICONS_DEF = {
    natur:  { emoji: '⛷️', color: '#0078D7' },
    bau:    { emoji: '⛏️', color: '#F57C00' },
    waechte:{ emoji: '❄️', color: '#00BCD4' },
    gefahr: { emoji: '⚠️', color: '#D32F2F' }
};