export class VideoPlayer {
    constructor() {
        this.overlay = document.getElementById('video-overlay');
        this.player = document.getElementById('fullscreen-player');
        this.closeBtn = document.getElementById('close-video');
        
        this._initEvents();
    }

    _initEvents() {
        if (this.closeBtn) this.closeBtn.onclick = () => this.close();
        if (this.overlay) {
            this.overlay.onclick = (e) => {
                if (e.target === this.overlay) this.close();
            };
        }
    }

    open(filename) {
        if (!filename) return;
        this.player.src = `videos/${filename}`;
        this.overlay.classList.remove('overlay-hidden');
        this.overlay.style.display = 'flex'; 
        this.player.play();
    }

    close() {
        this.player.pause();
        this.overlay.classList.add('overlay-hidden');
        this.overlay.style.display = 'none';
        this.player.src = "";
    }
}