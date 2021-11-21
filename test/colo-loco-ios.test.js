const fs = require("fs-extra")

const { createTempApp } = require("./helpers")

const APP_NAME = "TestApp"

const originalDir = process.cwd()
let appPath

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

    expect(xcodeProject).toContain("Foo.m")
    expect(xcodeProject).toContain("Foo.h")
    expect(xcodeProject).toContain("Bar.swift")
    expect(xcodeProject).toContain("Bar.m")
  })
})
