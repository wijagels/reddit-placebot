const fs = require('fs')
const axios = require('axios')
const Jimp = require('jimp')
const path = require('path');
const xdgBasedir = require('xdg-basedir')

const cachedir = path.join(xdgBasedir.cache, 'placebot')
const configdir = path.join(xdgBasedir.config, 'placebot')
const config = require(path.join(configdir,'/config'))
const colors = require('./colors')

function load () {
  return loadFromUrl(config.BOARD_URL)
}

function loadFromUrl (url) {
  return axios.get(url, {
    responseType: 'arraybuffer'
  }).then(function (response) {
    return saveAsBmp(response.data)
  })
}

function loadFromRawFile (file) {
  let boardBuffer = fs.readFileSync(file)
  return saveAsBmp(boardBuffer)
}

function saveAsBmp (buffer) {
  let img = new Jimp(1000, 1000)

  let pixels = []

  let i = 4
  for (let y = 0; y < 1000; ++y) {
    for (let x = 0; x < 500; ++x) {
      let datum = buffer[i]

      let color1 = datum >> 4
      let color2 = datum - (color1 << 4)

      color1 = colors.byInt[color1]
      color2 = colors.byInt[color2]

      img.setPixelColor(color1, x * 2,     y)
      img.setPixelColor(color2, x * 2 + 1, y)

      ++i
    }
  }

  return new Promise((resolve) => {
    img.write(path.join(cachedir, config.BOARD_FILE), function () {
      resolve(fs.readFileSync(path.join(cachedir, config.BOARD_FILE)))
    })
  })
}

module.exports = {
  load: load,
  loadFromRawFile: loadFromRawFile,
  loadFromUrl: loadFromUrl,
  saveAsBmp: saveAsBmp
}
