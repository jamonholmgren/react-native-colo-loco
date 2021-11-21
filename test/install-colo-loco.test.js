const fs = require("fs-extra")

const { runColoLoco, createTempDir } = require("./helpers")

const APP_NAME = "TestApp"
const SOURCE_FOLDER = "src"
const PACKAGE_NAME = "com.testapp"
const ANDROID_PATH = "android/app/src/main/java/com/testapp"

const originalDir = process.cwd()
let tempDir

beforeEach(async () => {
  tempDir = await createTempDir()
  process.chdir(tempDir)
})

afterEach(async () => {
  process.chdir(originalDir)
  await fs.remove(tempDir)
})

describe("Checking for install-colo-loco. 🤪", () => {
  it("installs correctly", async () => {
    const { output, error, code } = await runColoLoco({
      appName: APP_NAME,
      sourceFolder: SOURCE_FOLDER,
      packageName: PACKAGE_NAME,
    })

    expect(code).toBe(0)
    expect(error).toBe("")

    // uses the right defaults (app name & source folder)
    expect(output).toContain(APP_NAME)
    expect(output).toContain(SOURCE_FOLDER)

    // iOS set up is correct
    // Podfile
    const podfile = await fs.readFile(`${tempDir}/ios/Podfile`, "utf8")
    expect(podfile).toContain("react-native-colo-loco/scripts/ios.rb")
    expect(podfile).toContain("link_colocated_native_files")

    // Android set up is correct
    // settings.gradle
    const settingsGradle = await fs.readFile(`${tempDir}/android/settings.gradle`, "utf8")
    expect(settingsGradle).toContain("react-native-colo-loco/scripts/android.groovy")
    expect(settingsGradle).toContain("linkColocatedNativeFiles")
    expect(settingsGradle).toContain(PACKAGE_NAME)

    // AppPackage.java
    const appPackage = await fs.readFile(`${tempDir}/${ANDROID_PATH}/${APP_NAME}Package.java`, "utf8")
    expect(appPackage).toContain("modules.addAll(ColoLoco.colocatedModules(reactContext))")
    expect(appPackage).toContain("modules.addAll(ColoLoco.colocatedViewManagers(reactContext))")

    // MainApplication.java
    const mainApplication = await fs.readFile(`${tempDir}/${ANDROID_PATH}/MainApplication.java`, "utf8")
    expect(mainApplication).toContain(`packages.add(new ${APP_NAME}Package())`)
  })
})
