export class UIUtils {
    static createEmojiIcon(emoji, color, hasVideo) {
        // Zugriff auf globales L (Leaflet)
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
    }
}