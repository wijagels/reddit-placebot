const fs = require('fs')
const axios = require('axios')
const path = require('path');
const xdgBasedir = require('xdg-basedir')

const cachedir = path.join(xdgBasedir.cache, 'placebot')
const configdir = path.join(xdgBasedir.config, 'placebot')

const config = require(path.join(configdir, '/config'))
console.log(config);

function load () {
  if (config.autoupdateRemoteTarget) {
    return fromUrl(config.REMOTE_TARGET_URL)
  } else {
    return fromFile(path.join(cachedir, config.TARGET_FILE))
  }
}

function fromFile (file_name) {
  return Promise.resolve(fs.readFileSync(file_name))
}

function fromUrl (url) {
  return axios.get(url, {
    responseType: 'arraybuffer'
  }).then(function (response) {
    fs.writeFileSync(path.join(cachedir, config.TARGET_FILE), response.data)
    return response.data
  })
}

module.exports = {
  load: load,
  fromFile: fromFile,
  fromUrl: fromUrl
}
