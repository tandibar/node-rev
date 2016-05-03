import revHash from'rev-hash'
import revPath from'rev-path'
import path from'path'
import fs from'fs-extra'
import glob from'glob'
import commondir from'commondir'
import assert from'assert'

export default function(options) {

  const manifest = {}
  //use assert to require filesPath, outputDir
  const filesPath = options.files
  const outputDir = options.outputDir
  const outputDest = path.resolve(outputDir)
  const file = options.file
  const hash = options.hash

  function writeManifest(manifest) {
    if (file) {
      fs.ensureFileSync(path.resolve(file))
      fs.writeFileSync(path.resolve(file), JSON.stringify(manifest), 'utf8')
    } else {
      fs.writeFileSync(path.join(__dirname, 'assets.json'), JSON.stringify(manifest), 'utf8');
    }
  }

  const files = glob.sync(path.resolve(filesPath), {})

  let baseDir
  if (files && files.length === 1) {
    baseDir = files[0].split('/').slice(0,-1).join('/')
  } else {
    baseDir = commondir(files)
  }
  if (files && files.length) {
    files.forEach(function(file) {
      const parsedPath = path.parse(file)
      const filename = parsedPath.base
      const dirParts = parsedPath.dir.split('/')
      let fileDir = ''
      if (baseDir !== parsedPath.dir) {
        fileDir = dirParts.pop()
      }
      const buffer = fs.readFileSync(file)
      if (hash) {
        const hash = revHash(buffer)
        const revdPath = revPath(path.join(fileDir, filename), hash)
        manifest[path.join(fileDir, filename)] = revdPath
        fs.ensureFileSync(path.join(outputDest, revdPath))
        fs.writeFileSync(path.join(outputDest, revdPath), buffer)
      } else {
        manifest[path.join(fileDir, filename)] = path.join(fileDir, filename)
        fs.ensureFileSync(path.join(outputDest, path.join(fileDir, filename)))
        fs.writeFileSync(path.join(outputDest, path.join(fileDir, filename)), buffer)
      }
    })
    writeManifest(manifest)

  } else {
    writeManifest({})
  }
}