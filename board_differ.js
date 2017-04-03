const bmp = require('bmp-js')
const colors = require('./colors')

// Takes the 2 buffers and returns a valid paint to make
// the targetBuffer meet the requiremetns

let HEIGHT = 1000
let WIDTH = 1000
let TRANSPARENT = 0xff00ffff

const ADJACENT = [-4, 4, -4 * WIDTH, 4 * WIDTH];

module.exports = function (rawBoardBuffer, rawTargetBuffer) {
  let targetBuffer = bmp.decode(rawTargetBuffer).data
  let boardBuffer = bmp.decode(rawBoardBuffer).data

  let targets = []
  let total = 0
  let len = targetBuffer.byteLength
  for (let i = 0; i < len-4; i += 4) {
    let val = targetBuffer.readUIntBE(i, 4)
    if (val !== TRANSPARENT) {
      total++
      let boardVal = boardBuffer.readUIntBE(i, 4)
      if (boardVal !== val) {
        let n = (i/4)
        let x = n % 1000
        let y = Math.floor(n / 1000)
        let color = colors.byInt.indexOf(val)
        if (color == -1) {
          console.log("Bad color " + val + " x,y: " + x + "," + y)
        } else {
          let adjacent = 0;
          for (let delta of ADJACENT) {
            adjacent += checkPixel(i + delta, targetBuffer, boardBuffer);
          }
          targets.push({x: x, y: y, color: color, adjacent: adjacent});
        }
      }
    }
  }
  console.log("Available targets: " + targets.length + "/" + total + " (" + round(100*(1 - targets.length / total), 2) + "% completed)");
  if (targets.length > 0) {
    targets.sort((a, b) => b.adjacent - a.adjacent);
    let max = targets[0].adjacent;
    let n = 0;
    for (n = 0; n < targets.length; n++) {
      if (targets[n].adjacent < max) break;
    }
    return targets[Math.floor(Math.random() * n)];
  }

  return null
}

// returns true if the pixel is correct
function checkPixel(index, boardBuffer, targetBuffer) {
  if (index < 0 || index > 4 * WIDTH * HEIGHT - 4) {
    return true;
  }
  let val = targetBuffer.readUIntBE(index, 4);
  if (val === TRANSPARENT) return false;
  return val === boardBuffer.readUIntBE(index, 4);
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}
