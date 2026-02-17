const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUTPUT_FILE = path.join(ROOT, "structure.json");

const IGNORE_DIRS = new Set([
    ".git",
    "node_modules",
    ".next",
    "guiding_light"
]);

function scan(dir) {
    const result = [];

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory() && IGNORE_DIRS.has(entry.name)) {
            continue;
        }

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            result.push({
                type: "folder",
                name: entry.name,
                children: scan(fullPath)
            });
        } else {
            result.push({
                type: "file",
                name: entry.name
            });
        }
    }

    return result;
}

const structure = scan(ROOT);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(structure, null, 2), "utf-8");

console.log("Saved to structure.json");
