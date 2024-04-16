export function extractFilenameFromUrl(url) {
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1];
  const partWithoutExtension = lastPart.split(".")[0];
  return partWithoutExtension;
}
