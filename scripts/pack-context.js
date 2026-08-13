import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Save output directly inside the scripts/ folder
const OUTPUT_FILE = path.join(__dirname, "project_context.txt");

// Project root directory (one level up from scripts/)
const ROOT_DIR = path.resolve(__dirname, "..");

// Directories and top-level files to include
const TARGET_DIRS = ["src", "scripts", "dummy", "tests", ".github"];
const TARGET_ROOT_FILES = [
  "index.js",
  "package.json",
  "README.md",
  "Dockerfile",
  "Dockerfile.dev",
  "compose.yml",
  ".env.example",
  ".gitignore",
  ".dockerignore",
];

// Supported text extensions
const TEXT_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".scss",
  ".json",
  ".html",
  ".svg",
  ".md",
  ".yml",
  ".yaml",
  ".env",
  ".example",
  ".sh",
  ".txt",
]);

const IGNORE_FILES = new Set([
  ".DS_Store",
  "thumbs.db",
  "package-lock.json",
  "project_context.txt",
]);

function getLanguageTag(ext, fileName = "") {
  if (fileName.toLowerCase().includes("dockerfile")) return "dockerfile";

  const map = {
    ".js": "javascript",
    ".jsx": "jsx",
    ".ts": "typescript",
    ".tsx": "tsx",
    ".css": "css",
    ".scss": "scss",
    ".json": "json",
    ".html": "html",
    ".svg": "xml",
    ".md": "markdown",
    ".yml": "yaml",
    ".yaml": "yaml",
    ".sh": "bash",
    ".env": "dotenv",
    ".txt": "text",
  };
  return map[ext] || "";
}

function buildTree(dirPath, prefix = "") {
  let tree = "";
  if (!fs.existsSync(dirPath)) return tree;

  const items = fs
    .readdirSync(dirPath)
    .filter((item) => !IGNORE_FILES.has(item))
    .sort();

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const fullPath = path.join(dirPath, item);
    const isDir = fs.statSync(fullPath).isDirectory();

    tree += `${prefix}${connector}${item}\n`;

    if (isDir) {
      const extension = isLast ? "    " : "│   ";
      tree += buildTree(fullPath, prefix + extension);
    }
  });

  return tree;
}

function getFiles(dirPath) {
  let results = [];
  if (!fs.existsSync(dirPath)) return results;

  const list = fs.readdirSync(dirPath);
  list.forEach((file) => {
    if (IGNORE_FILES.has(file)) return;

    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (
        TEXT_EXTENSIONS.has(ext) ||
        file.toLowerCase().includes("dockerfile")
      ) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

function packContext() {
  let output =
    "======================================================================\n";
  output += "PROJECT ARCHITECTURE TREE\n";
  output +=
    "======================================================================\n\n";

  // Build root files & directory tree view
  TARGET_ROOT_FILES.forEach((file) => {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) {
      output += `${file}\n`;
    }
  });

  TARGET_DIRS.forEach((dir) => {
    const dirPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(dirPath)) {
      output += `${dir}/\n`;
      output += buildTree(dirPath);
      output += "\n";
    }
  });

  let fileCount = 0;

  // Gather file paths to process
  let allFiles = [];

  // Add individual root files
  TARGET_ROOT_FILES.forEach((file) => {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) allFiles.push(filePath);
  });

  // Add files from target directories
  TARGET_DIRS.forEach((dir) => {
    const dirPath = path.join(ROOT_DIR, dir);
    allFiles = allFiles.concat(getFiles(dirPath));
  });

  // Pack file contents
  allFiles.forEach((filePath) => {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");
    const ext = path.extname(filePath).toLowerCase();
    const lang = getLanguageTag(ext, path.basename(filePath));

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      output +=
        "======================================================================\n";
      output += `FILE: ${relativePath}\n`;
      output +=
        "======================================================================\n";
      output += `\`\`\`${lang}\n`;
      output += content.endsWith("\n") ? content : content + "\n";
      output += "```\n\n";
      fileCount++;
    } catch (err) {
      output += `/* Error reading file ${relativePath}: ${err.message} */\n\n`;
    }
  });

  fs.writeFileSync(OUTPUT_FILE, output, "utf-8");
  console.log(`Done! Packed ${fileCount} files into ${OUTPUT_FILE}`);
}

packContext();
