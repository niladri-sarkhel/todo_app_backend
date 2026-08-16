import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root directory (one level up from scripts/)
const ROOT_DIR = path.resolve(__dirname, "..");

// Save output directly inside the scripts/ folder
const OUTPUT_FILE = path.join(__dirname, "project_context.txt");

// Files/folders to strictly ignore
const IGNORE_NAMES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".DS_Store",
  "thumbs.db",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "project_context.txt",
  ".env", // Ignored for security; .env.example will still be included
  "mongo-keyfile", // Ignored for security
]);

// File extensions to ignore (binary/media/keys)
const IGNORE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".ico",
  ".svg",
  ".webp",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".7z",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".key",
  ".pem",
  ".crt",
  ".db",
  ".sqlite",
]);

// Language mappings for Markdown code blocks
const EXTENSION_LANG_MAP = {
  ".js": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".jsx": "jsx",
  ".ts": "typescript",
  ".tsx": "tsx",
  ".json": "json",
  ".html": "html",
  ".css": "css",
  ".scss": "scss",
  ".md": "markdown",
  ".yml": "yaml",
  ".yaml": "yaml",
  ".sh": "bash",
  ".bash": "bash",
  ".env": "dotenv",
  ".example": "dotenv",
  ".txt": "text",
  ".sql": "sql",
};

/**
 * Checks if a file or directory should be ignored.
 */
function shouldIgnore(itemName) {
  if (IGNORE_NAMES.has(itemName)) return true;

  const ext = path.extname(itemName).toLowerCase();
  if (IGNORE_EXTENSIONS.has(ext)) return true;

  // Ignore arbitrary hidden files, but allow critical configs
  if (
    itemName.startsWith(".") &&
    !itemName.startsWith(".env") &&
    !itemName.startsWith(".github") &&
    !itemName.startsWith(".gitignore") &&
    !itemName.startsWith(".dockerignore")
  ) {
    return true;
  }

  return false;
}

/**
 * Determines code block language tag for syntax highlighting.
 */
function getLanguageTag(filePath) {
  const fileName = path.basename(filePath).toLowerCase();

  if (fileName.includes("dockerfile")) return "dockerfile";
  if (fileName === ".gitignore" || fileName === ".dockerignore")
    return "ignorefile";

  const ext = path.extname(filePath).toLowerCase();
  return EXTENSION_LANG_MAP[ext] || "";
}

/**
 * Generates an ASCII tree view starting from the root directory.
 */
function generateTree(dirPath, prefix = "") {
  let tree = "";
  if (!fs.existsSync(dirPath)) return tree;

  const items = fs
    .readdirSync(dirPath)
    .filter((item) => !shouldIgnore(item))
    .sort((a, b) => {
      // Sort directories first, then files alphabetically
      const aIsDir = fs.statSync(path.join(dirPath, a)).isDirectory();
      const bIsDir = fs.statSync(path.join(dirPath, b)).isDirectory();
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const fullPath = path.join(dirPath, item);
    const isDir = fs.statSync(fullPath).isDirectory();

    tree += `${prefix}${connector}${item}${isDir ? "/" : ""}\n`;

    if (isDir) {
      const childPrefix = prefix + (isLast ? "    " : "│   ");
      tree += generateTree(fullPath, childPrefix);
    }
  });

  return tree;
}

/**
 * Recursively collects all non-ignored file paths.
 */
function collectFiles(dirPath) {
  let files = [];
  if (!fs.existsSync(dirPath)) return files;

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    if (shouldIgnore(item)) continue;

    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(collectFiles(fullPath));
    } else if (stat.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Packs the repository structure and contents into a single file.
 */
function packContext() {
  let output =
    "======================================================================\n";
  output += "PROJECT ARCHITECTURE TREE\n";
  output +=
    "======================================================================\n\n";

  // 1. Root-level tree
  output += ".\n";
  output += generateTree(ROOT_DIR);
  output += "\n";

  // 2. Gather file contents
  const allFiles = collectFiles(ROOT_DIR).sort();
  let packedCount = 0;

  output +=
    "======================================================================\n";
  output += "FILE CONTENTS\n";
  output +=
    "======================================================================\n\n";

  for (const filePath of allFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");
    const lang = getLanguageTag(filePath);

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
      packedCount++;
    } catch (err) {
      output += `/* Error reading file ${relativePath}: ${err.message} */\n\n`;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, output, "utf-8");
  console.log(` Done! Packed ${packedCount} files into ${OUTPUT_FILE}`);
}

packContext();
