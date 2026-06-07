import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ENV_FILE_PATTERN = /^\.env(\..+)?$/;
const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", ".turbo"]);

/**
 * Recursively finds .env* files under root, skipping common build/vendor dirs.
 */
export function findEnvFiles(root: string, depth = 5): string[] {
	const results: string[] = [];

	const walk = (dir: string, remaining: number) => {
		if (remaining < 0) return;
		let entries;
		try {
			entries = readdirSync(dir, { withFileTypes: true });
		} catch {
			return;
		}

		for (const entry of entries) {
			const fullPath = join(dir, entry.name);
			if (entry.isDirectory()) {
				if (IGNORE_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
				walk(fullPath, remaining - 1);
			} else if (entry.isFile() && ENV_FILE_PATTERN.test(entry.name)) {
				results.push(fullPath);
			}
		}
	};

	walk(root, depth);
	return results;
}

export function isFile(path: string): boolean {
	try {
		return statSync(path).isFile();
	} catch {
		return false;
	}
}
