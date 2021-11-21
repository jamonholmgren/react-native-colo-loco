const path = require("path")
const os = require("os")
const fs = require("fs-extra")
const { spawn } = require("child_process")

const COLO_LOCO = path.join(__dirname, "../scripts/install-colo-loco")

/**
 * Runs `install-colo-loco` and passes it the given `appName`, `sourceFolder` and `packageName`.
 *
 * @param {Object} options Colo Loco options
 * @param {String} options.appPath Path to the app folder (the script will run in this folder)
 * @param {String} options.appName App name to pass to `install-colo-loco`
 * @param {String} options.sourceFolder Source folder to pass to `install-colo-loco`
 * @param {String} options.packageName Package name to pass to `install-colo-loco`
 * @param {Array<String>} args Array of arguments to pass to `install-colo-loco`
 * @returns {Promise<Object>} Object with the following properties:
 * - `status`: exit code of `install-colo-loco`
 * - `output`: stdout of `install-colo-loco`
 * - `error`: stderr of `install-colo-loco`
 */
function runColoLoco({ appPath, appName, sourceFolder, packageName } = {}, args = []) {
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

    // pass app name
    cp.stdin.write(appName + "\n")

    // pass source folder
    cp.stdin.write(sourceFolder + "\n")

    // pass package name
    cp.stdin.write(packageName + "\n")
  })
}

async function createTempApp(appName = "TestApp", sourceFolder = "src", packageName = "com.testapp") {
  // create temp folder
  const tempDir = path.join(os.tmpdir(), `colo-loco-test-${Math.random()}`)
  await fs.mkdir(tempDir)

  // copy TestApp to temp folder
  await fs.copy(path.join(__dirname, "../TestApp"), tempDir)

  // move android Java files to new package name based folder
  await fs.move(
    path.join(tempDir, "android/app/src/main/java/com/testapp"),
    path.join(tempDir, `android/app/src/main/java/${packageName.split(".").join("/")}`)
  )

  // move `src` folder to new source folder
  await fs.move(path.join(tempDir, "src"), path.join(tempDir, sourceFolder))

  // change app name in `app.json`
  const appJSON = await fs.readJSON(path.join(tempDir, "app.json"))
  appJSON.name = appName
  await fs.writeJSON(path.join(tempDir, "app.json"), appJSON)

  return tempDir
}

module.exports = { runColoLoco, createTempApp }
