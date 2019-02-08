const fs = require('fs');
const path = require('path');
const https = require('https');

const forceDirectories = require('./force-directories');

module.exports = (url, file, callback) => {
    forceDirectories(path.dirname(file));

    let outfile = fs.createWriteStream(file);
    https.get(
        url,
        (response) => {
            response.pipe(outfile);
            outfile.on('finish', () => outfile.close(callback));
        }
    ).on(
        'error', 
        (err) => { // Handle errors
            fs.unlink(dest); // Delete the file async. (But we don't check the result)
            if (callback) callback(err);
        }
    )
}
