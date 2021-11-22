const fs = require("fs-extra")

const { createTempApp } = require("./helpers")

const APP_NAME = "TestApp"

const originalDir = process.cwd()
let appPath

jest.setTimeout(30000) // 30 seconds

beforeEach(async () => {
  appPath = await createTempApp({ setupIOS: true, setupColoLoco: true })
  process.chdir(appPath)
})

afterEach(async () => {
  process.chdir(originalDir)
  await fs.remove(appPath)
})

describe("Checking Colo Loco on iOS. 🤪", () => {
  it("links files correctly", async () => {
    const xcodeProject = await fs.readFile(`${appPath}/ios/${APP_NAME}.xcodeproj/project.pbxproj`, "utf8")

    // Native Modules
    expect(xcodeProject).toContain("Foo.m")
    expect(xcodeProject).toContain("Foo.h")
    expect(xcodeProject).toContain("Bar.swift")
    expect(xcodeProject).toContain("Bar.m")

    // Native UI Views
    expect(xcodeProject).toContain("FooViewManager.m")
    expect(xcodeProject).toContain("FooViewManager.h")
  })
})
