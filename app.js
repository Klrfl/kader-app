import fs from "node:fs"

const files = fs.readdirSync(".")

for (const file of files) {
  if (file.startsWith("simurgh")) {
  console.log(file)
  }
}
