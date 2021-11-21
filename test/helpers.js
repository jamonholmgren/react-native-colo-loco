const path = require("path")
const os = require("os")
const fs = require("fs-extra")
const { spawn, spawnSync } = require("child_process")

const COLO_LOCO = path.join(__dirname, "../scripts/install-colo-loco")

/**
 * Runs `install-colo-loco` and passes it the given `appName`, `sourceFolder` and `packageName`.
 *
 * @param {Object} options Colo Loco options
 * @param {String} options.appPath Path to the app folder (the script will run in this folder)
 * @param {Array<String>} options.input Array of strings to pass as input to stdin
 * @param {Array<String>} args Array of arguments to pass to `install-colo-loco`
 * @returns {Promise<Object>} Object with the following properties:
 * - `status`: exit code of `install-colo-loco`
 * - `output`: stdout of `install-colo-loco`
 * - `error`: stderr of `install-colo-loco`
 */
function runColoLoco({ appPath, input = [] } = {}, args = []) {
  return new Promise((resolve) => {
    const cp = spawn("node", [COLO_LOCO, ...args], { cwd: appPath })

    // store stdout in `output` variable
    let output = ""
    cp.stdout.on("data", (data) => {
      output += data.toString()
    })

    // store stderr in `error` variable
    let error = ""
    cp.stderr.on("data", (data) => {
      error += data.toString()
    })

    // wait for process to exit
    cp.on("close", (status) => {
      resolve({ output, error, status })
    })

    input.forEach((n) => cp.stdin.write(n + "\n"))
  })
}

async function createTempApp({ initGit = false } = {}) {
  // create temp folder
  const tempDir = path.join(os.tmpdir(), `colo-loco-test-${Math.random()}`)
  await fs.mkdir(tempDir)

  // copy TestApp to temp folder
  await fs.copy(path.join(__dirname, "../TestApp"), tempDir)

  // init git repo
  if (initGit) {
    spawnSync("git", ["init"], { cwd: tempDir })
  }

  return tempDir
}

module.exports = { runColoLoco, createTempApp }
