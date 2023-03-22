// update-manifest-version.js
const fs = require('fs')
const path = require('path')

const manifestPath = path.join(__dirname, '..', '..', 'static', 'manifest.json')
const manifest = require(manifestPath)
const version = process.argv[2]

manifest.version = version
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
