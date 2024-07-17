import { glob } from 'glob';
import fs from 'node:fs/promises';
import { copy, CopyFilterAsync, CopyFilterSync } from 'fs-extra';
import { join } from 'node:path';

/**
 * Returns true if a given version of a resource id exists in the catalog
 */
export const versionExists = async (catalogDir: string, id: string, version: string) => {
  const files = await getFiles(`${catalogDir}/**/index.md`);
  const matchedFiles = (await searchFilesForId(files, id, version)) || [];
  return matchedFiles.length > 0;
};

export const findFileById = async (
  catalogDir: string,
  id: string,
  version?: string
): Promise<string | undefined> => {
  const files = await getFiles(`${catalogDir}/**/index.md`);
  const matchedFiles = (await searchFilesForId(files, id)) || [];

  // Return the latest one
  if (!version) {
    return matchedFiles.find((path) => !path.includes('versioned'));
  }

  // Find the versioned event
  return matchedFiles.find((path) => path.includes(`versioned/${version}`));
};

export const getFiles = async (pattern: string) => {
  try {
    const files = await glob(pattern, { ignore: 'node_modules/**' });
    return files;
  } catch (error) {
    throw new Error(`Error finding files: ${error}`);
  }
};

export const searchFilesForId = async (files: string[], id: string, version?: string) => {
  const idRegex = new RegExp(`^id:\\s*['"]?${id}['"]?\\s*$`, 'm');
  const versionRegex = new RegExp(`^version:\\s*['"]?${version}['"]?\\s*$`, 'm');

  const matches = await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(file, 'utf-8');
      const hasIdMatch = content.match(idRegex);

      // Check version if provided
      if (version && !content.match(versionRegex)) {
        return undefined;
      }

      if (hasIdMatch) {
        return file;
      }
    })
  );

  return matches.filter(Boolean).filter((file) => file !== undefined);
};

/**
 * Function to copy a directory from source to target, uses a tmp directory
 * @param catalogDir
 * @param source
 * @param target
 * @param filter
 */
export const copyDir = async (
  catalogDir: string,
  source: string,
  target: string,
  filter?: CopyFilterAsync | CopyFilterSync
) => {
  const tmpDirectory = join(catalogDir, 'tmp');
  await fs.mkdir(tmpDirectory, { recursive: true });

  // Copy everything over
  await copy(source, tmpDirectory, {
    overwrite: true,
    filter,
  });

  await copy(tmpDirectory, target, {
    overwrite: true,
    filter,
  });

  // Remove the tmp directory
  await fs.rm(tmpDirectory, { recursive: true });
};