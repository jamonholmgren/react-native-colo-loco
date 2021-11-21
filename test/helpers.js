const path = require("path")
const os = require("os")
const fs = require("fs-extra")
const { spawn } = require("child_process")

const COLO_LOCO = path.join(__dirname, "../scripts/install-colo-loco")

function runColoLoco({ appName, sourceFolder, packageName } = {}, args = []) {
  return new Promise((resolve) => {
    const cp = spawn("node", [COLO_LOCO, ...args])

    let output = ""
    cp.stdout.on("data", (data) => {
      output += data.toString()
      console.log(data.toString())
    })

    let error = ""
    cp.stderr.on("data", (data) => {
      console.log(data.toString())
      error += data.toString()
    })

    cp.on("close", (code) => {
      resolve({ output, error, code })
    })

    cp.stdin.write(appName + "\n")
    cp.stdin.write(sourceFolder + "\n")
    cp.stdin.write(packageName + "\n")
  })
}

async function createTempDir() {
  const tempDir = path.join(os.tmpdir(), `colo-loco-test-${Math.random()}`)
  await fs.mkdir(tempDir)
  await fs.copy(path.join(__dirname, "../TestApp"), tempDir)
  return tempDir
}

module.exports = { runColoLoco, createTempDir }
