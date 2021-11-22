const path = require("path")
const os = require("os")
const fs = require("fs-extra")
const { spawn, execSync } = require("child_process")

const VERBOSE = Boolean(process.env.VERBOSE)
const stdio = VERBOSE ? "inherit" : "ignore"

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

async function createTempApp({ initGit = false, setupAndroid = false, setupIOS = false, setupColoLoco = false } = {}) {
  // create temp folder
  const tempDir = path.join(os.tmpdir(), `colo-loco-test-${Math.random()}`)
  await fs.mkdir(tempDir)

  // copy TestApp to temp folder
  await fs.copy(path.join(__dirname, "./TestApp"), tempDir)

  // init git repo
  if (initGit) {
    execSync("git init", { cwd: tempDir, stdio })
  }

  // setup Colo Loco
  if (setupColoLoco) {
    await runColoLoco({ appPath: tempDir }, ["--defaults"])
  }

  // install NPM packages
  if (setupAndroid || setupIOS) {
    execSync("yarn install --silent", { cwd: tempDir, stdio })
  }

  // install CocoaPods
  if (setupIOS) {
    execSync("pod install", { cwd: `${tempDir}/ios`, stdio: "inherit" })
  }

  // run `./gradlew clean` to link colocated files
  if (setupAndroid) {
    execSync("./gradlew clean", { cwd: `${tempDir}/android`, stdio })
  }

  return tempDir
}

module.exports = { runColoLoco, createTempApp }
