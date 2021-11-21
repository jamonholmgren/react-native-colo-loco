const fs = require("fs-extra")

const { createTempApp } = require("./helpers")

const ANDROID_PATH = "android/app/src/main/java/com/testapp"

const originalDir = process.cwd()
let appPath

beforeEach(async () => {
  appPath = await createTempApp({ setupAndroid: true, setupColoLoco: true })
  process.chdir(appPath)
})

afterEach(async () => {
  process.chdir(originalDir)
  await fs.remove(appPath)
})

describe("Checking Colo Loco on Android. 🤪", () => {
  it("links files correctly", async () => {
    const COLOCATED = `${appPath}/${ANDROID_PATH}/colocated`

    expect(fs.existsSync(`${COLOCATED}/Foo.java`)).toBeTruthy()
    expect(fs.existsSync(`${COLOCATED}/ColoLoco.java`)).toBeTruthy()

    const manifestFile = await fs.readFile(`${COLOCATED}/ColoLoco.java`, "utf8")
    expect(manifestFile).toContain("modules.add(new Foo(reactContext))")
  })
})
