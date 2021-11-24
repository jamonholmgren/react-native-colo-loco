const fs = require("fs-extra")

const { runColoLoco, createTempApp } = require("./helpers")

const APP_NAME = "TestApp"
const SOURCE_FOLDER = "src"
const PACKAGE_NAME = "com.testapp"
const ANDROID_PATH = "android/app/src/main/java/com/testapp"

const originalDir = process.cwd()
let appPath

afterEach(async () => {
  process.chdir(originalDir)
  await fs.remove(appPath)
})

describe("Checking for install-colo-loco. 🤪", () => {
  it("installs correctly", async () => {
    appPath = await createTempApp()

    const { output, error, status } = await runColoLoco({
      appPath,
      input: [APP_NAME, SOURCE_FOLDER, PACKAGE_NAME],
    })

    expect(status).toBe(0)
    expect(error).toBe("")

    // uses the right defaults (app name & source folder)
    expect(output).toContain(APP_NAME)
    expect(output).toContain(SOURCE_FOLDER)

    // iOS set up is correct
    // Podfile
    const podfile = await fs.readFile(`${appPath}/ios/Podfile`, "utf8")
    expect(podfile).toContain("react-native-colo-loco/scripts/ios.rb")
    expect(podfile).toContain("link_colocated_native_files")

    // Android set up is correct
    // settings.gradle
    const settingsGradle = await fs.readFile(`${appPath}/android/settings.gradle`, "utf8")
    expect(settingsGradle).toContain("react-native-colo-loco/scripts/android.groovy")
    expect(settingsGradle).toContain("linkColocatedNativeFiles")
    expect(settingsGradle).toContain(PACKAGE_NAME)

    // AppPackage.java
    const appPackage = await fs.readFile(`${appPath}/${ANDROID_PATH}/${APP_NAME}Package.java`, "utf8")
    expect(appPackage).toContain("modules.addAll(ColoLoco.colocatedModules(reactContext))")
    expect(appPackage).toContain("modules.addAll(ColoLoco.colocatedViewManagers(reactContext))")

    // MainApplication.java
    const mainApplication = await fs.readFile(`${appPath}/${ANDROID_PATH}/MainApplication.java`, "utf8")
    expect(mainApplication).toContain(`packages.add(new ${APP_NAME}Package())`)
  })

  it("uses good defaults when using --defaults", async () => {
    appPath = await createTempApp()

    const { output, status } = await runColoLoco({ appPath }, ["--defaults"])

    expect(status).toBe(0)
    expect(output).toContain(APP_NAME)
    expect(output).toContain(SOURCE_FOLDER)
  })

  it("stops if git working tree is diry and user don't continue", async () => {
    appPath = await createTempApp({ initGit: true })
    const { output, error, status } = await runColoLoco({
      appPath,
      input: ["N"],
    })
    expect(status).toBe(1)
    expect(error).toContain("git working tree is dirty")
    expect(error).toContain("commit or stash your changes")
  })

  it("continues if git working tree is dirty and user wants to continue", async () => {
    appPath = await createTempApp({ initGit: true })

    const { error, output, status } = await runColoLoco({
      appPath,
      input: ["y", APP_NAME, SOURCE_FOLDER, PACKAGE_NAME],
    })

    expect(status).toBe(0)
    expect(error).toContain("git working tree is dirty")
    expect(output).toContain(APP_NAME)
    expect(output).toContain(SOURCE_FOLDER)
  })

  it("skips git check when passing --no-git-check", async () => {
    appPath = await createTempApp({ initGit: true })

    const { output, status } = await runColoLoco({ appPath, input: [APP_NAME, SOURCE_FOLDER, PACKAGE_NAME] }, [
      "--no-git-check",
    ])

    expect(status).toBe(0)
    expect(output).toContain(APP_NAME)
    expect(output).toContain(SOURCE_FOLDER)
  })
})
