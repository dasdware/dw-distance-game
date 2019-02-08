const path = require('path');
const fs = require('fs');

function forceDirectories(dir) {
    if (!fs.existsSync(dir)) {
        let parentDir = path.dirname(dir);
        if (!fs.existsSync(parentDir)) {
            forceDirectories(parentDir);
        }
        fs.mkdirSync(dir);
    }
}


module.exports = forceDirectories;