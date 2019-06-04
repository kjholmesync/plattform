const upload = require('./upload')
const s3 = require('./s3')
const getWidthHeight = require('./getWidthHeight')
const returnImage = require('./returnImage')
const urlPrefixing = require('./urlPrefixing')
const webp = require('./webp')
const Repo = require('./Repo')

module.exports = {
  upload,
  s3,
  getWidthHeight,
  returnImage,
  webp,
  Repo,
  urlPrefixing,
  ...urlPrefixing
}
