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

    // Native Modules
    expect(xcodeProject.split("Foo.m in Sources */ = {isa = PBXBuildFile;").length - 1).toBe(2)
    expect(xcodeProject.split("Foo.h in Headers */ = {isa = PBXBuildFile;").length - 1).toBe(2)

    // check "Bar.swift" appears twice
    expect(xcodeProject.split("Bar.swift in Sources */ = {isa = PBXBuildFile;").length - 1).toBe(1)

    // check "Bar.m" appears once
    expect(xcodeProject.split("Bar.m in Sources */ = {isa = PBXBuildFile;").length - 1).toBe(1)

    // Native UI Views
    expect(xcodeProject.split("FooViewManager.m in Sources */ = {isa = PBXBuildFile;").length - 1).toBe(2)
    expect(xcodeProject.split("FooViewManager.h in Headers */ = {isa = PBXBuildFile;").length - 1).toBe(2)
  })
})
