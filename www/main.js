class Game {
    constructor(config) {
        this.config = config; 
        this.updateCompassAngle(0);
        this.connections = [];
        this.currentLayer = null;
    }

    updateCompassAngle(angle) {
        this.angle = angle;
        document.getElementById('compass').style.transform = 
            `translate(-50%, -50%) rotate(${this.angle}deg)`;
    }

    updateTitle(title) {
        document.getElementById('title').innerHTML = title;
    }

    updateSubTitle(subtitle) {
        document.getElementById('subtitle').innerHTML = subtitle;
    }

    updateUI() {
        if (this.currentSubStep == 0) {
            panel.classList.remove("min");
            if (this.currentLayer) {
                this.updateTitle(`Distance ${this.currentLayer.properties.distance.toFixed(1).toString().replace('.', ',')}km`);
                this.updateSubTitle(`Bearing ${this.currentLayer.properties.compass}`);
            }
        } else {
            panel.classList.add("min");
            if (this.currentLayer) {
                this.updateTitle(this.currentLayer.properties.name);
                this.updateSubTitle(this.currentLayer.properties.city);
            } else {
                this.updateTitle(this.base.name);
                this.updateSubTitle(this.base.city);
                this.updateCompassAngle(this.config.compassAngle);
            }
        }
    }

    init() {
        getJson('/base', (base) => {
            this.base = base;

            this.map = L.map(this.config.mapid, { zoomControl: false })
                .setView([this.base.latitude, this.base.longitude], this.config.zoom );

            this.tileLayer = L.tileLayer('map/{z}/{x}/{y}', { maxZoom: 18 });
            this.tileLayer.addTo(this.map);

            var marker = L.marker([this.base.latitude, this.base.longitude]).addTo(this.map);

            this.currentStep = -1;
            this.currentSubStep = 1;
            this.updateUI();

            this.createConnectionLayers();

            document.addEventListener("keydown", (event) => {
                if (event.code == "Space") {
                    this.nextStep();
                }
            });
        });
    }

    createConnectionLayers() {
        this.connectionLayers = [];
        this.visibleConnectionsLayers = L.featureGroup();

        getJson('/connections', (connections) => {
            connections.features.sort(
                (feature1, feature2) => feature1.properties.distance - feature2.properties.distance
            )
            this.connections = connections;
        
            for (let connection of connections.features) {
                let partGeoJSON = {
                    features: [ connection ],
                    type: connections.type,
                    properties: connection.properties
                };
                const layer = L.geoJSON(partGeoJSON, { style: this.config.activeStyle });
                layer.properties = connection.properties;
                this.connectionLayers.push(layer);
            }
        });
    }

    nextStep() {
        if (this.currentStep < this.connectionLayers.length) {
            if (this.currentSubStep == 1) {
                this.previousLayer = this.currentLayer;

                this.currentStep++;
                this.currentLayer = this.connectionLayers[this.currentStep];

                this.updateCompassAngle(this.currentLayer.properties.bearing + 180);
                this.currentSubStep = 0;
            } else {
                if (this.previousLayer) {
                    this.previousLayer.setStyle(this.config.inactiveStyle);
                }

                this.currentLayer.addTo(this.map);
                this.visibleConnectionsLayers.addLayer(this.currentLayer);
                this.map.fitBounds(this.visibleConnectionsLayers.getBounds());

                this.currentSubStep = 1;
            }
            this.updateUI();
        }
    }
};

getJson('/config', (config) => {
    let game = new Game(config);
    game.init();
});

