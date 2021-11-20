const fs = require("fs-extra")

const { runColoLoco, createTempDir } = require("./helpers")

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
  test("install-colo-loco", async () => {
    const { stdout } = await runColoLoco("--defaults")
    // TODO: test script
  })
})
