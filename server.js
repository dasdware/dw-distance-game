const express = require('express');
const fs = require('fs');
const path = require('path');

const downloadHttps = require('./src/download-https');
const transformData = require('./src/transform-data');

const config = require('./config.json');
const app = express();

const data = transformData(require(config.locations));

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname + '/www/index.html'));
});

app.get('/base', (request, response) => {
    response.send(data.base);
});

app.get('/connections', (request, response) => {
    response.send(data.connections);
});

app.get('/config', (request, response) => {
    response.sendFile(path.join(__dirname, '/config.json'));
});


/* Ressource files */
app.get('/www*', (request, response) => {
    const file = path.join(__dirname, request.path);
    if (fs.existsSync(file)) {
        response.sendFile(file);
    } else {
        response.status(404).send('not found');
    }
});

/* Get map tiles. Download them, if neccessary. */
app.get('/map/:z/:x/:y', (request, response) => {
    let file = path.join(__dirname + `/tiles/${request.params.z}/${request.params.x}/${request.params.y}.png`);
    if (!fs.existsSync(file)) {
        console.warn(`File ${file} does not yet exist, trying to download it from osm`);

        downloadHttps(
            config.server.externalTileUrl
                .replace('{x}', request.params.x)
                .replace('{y}', request.params.y)
                .replace('{z}', request.params.z),
            file,
            (error) => {
                if (error) {
                    response.status(500).send(error.message);
                    console.error(error.message);
                } else {
                    console.log('Downloaded ' + file);
                    response.sendFile(file);
                }
            }    
        );
    } else {
        response.sendFile(file);
    }
    
});

/* Start the server */
app.listen(config.server.port);
