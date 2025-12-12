export class ElevationChart {
    constructor(canvasId) {
        this.ctx = document.getElementById(canvasId).getContext('2d');
        this.chartInstance = null;
    }

    update(routeData, onHoverCallback) {
        const labels = routeData.map(d => Math.round(d.dist));
        const elevations = routeData.map(d => d.elev);

        if (this.chartInstance) this.chartInstance.destroy();

        // Zugriff auf globales Chart
        this.chartInstance = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Höhe (m)',
                    data: elevations,
                    borderColor: '#D32F2F', 
                    backgroundColor: 'rgba(211, 47, 47, 0.2)',
                    borderWidth: 2, 
                    pointRadius: 0, 
                    pointHoverRadius: 6, 
                    pointHoverBackgroundColor: 'yellow',
                    pointHoverBorderColor: 'black',
                    fill: true, 
                    tension: 0.1
                }]
            },
            options: {
                responsive: true, 
                maintainAspectRatio: false,
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
                    if (onHoverCallback) {
                         const index = (elements && elements.length > 0) ? elements[0].index : -1;
                         onHoverCallback(index);
                    }
                }
            }
        });
    }

    clear() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
    }
}