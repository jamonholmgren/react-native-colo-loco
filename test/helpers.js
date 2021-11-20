const path = require("path")
const os = require("os")
const fs = require("fs-extra")
const { exec } = require("child_process")
const { promisify } = require("util")

const run = promisify(exec)

const COLO_LOCO = path.join(__dirname, "../scripts/install-colo-loco")

function runColoLoco(args) {
  return run(`node ${COLO_LOCO} ${args}`)
}

async function createTempDir() {
  const tempDir = path.join(os.tmpdir(), `colo-loco-test-${Math.random()}`)
  await fs.mkdir(tempDir)
  await fs.copy(path.join(__dirname, "../TestApp"), tempDir)
  return tempDir
}

module.exports = { runColoLoco, createTempDir }
