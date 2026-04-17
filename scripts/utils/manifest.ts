import fg from "fast-glob";
import path from "node:path";

/** Recursively finds all .ts files in folderPath. Uses fast-glob for performance. */
export const flatIterdir = async (folderPath: string): Promise<string[]> => {
  const absPath = path.resolve(folderPath);
  const result = await fg("**/*", { cwd: absPath, absolute: true, onlyFiles: true });
  return result.map(el=>path.relative(path.dirname(absPath), el.replaceAll('\\', '/')));
};