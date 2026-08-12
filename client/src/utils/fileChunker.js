export const CHUNK_SIZE = 64 * 1024;

export const fileToChunks = async (
  file,
  onProgress
) => {
  const chunks = [];

  let offset = 0;

  while (offset < file.size) {
    const chunk = file.slice(
      offset,
      offset + CHUNK_SIZE
    );

    const buffer = await chunk.arrayBuffer();

    chunks.push(buffer);

    offset += chunk.size;

    const progress = Math.round(
      (offset / file.size) * 100
    );

    onProgress?.(progress);
  }

  return chunks;
};