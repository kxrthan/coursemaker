import { get, set } from 'idb-keyval';

// Recursively reads a directory handle and returns a flat array of File objects.
// Manually attaches a webkitRelativePath so our existing fileParser can process them.
export async function readDirectoryAsFiles(dirHandle: any, path: string = ''): Promise<File[]> {
  const files: File[] = [];
  
  // File System Access API async iterators
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      
      // Override webkitRelativePath for the parser to simulate <input webkitdirectory>
      Object.defineProperty(file, 'webkitRelativePath', {
        value: `${path ? path + '/' : ''}${dirHandle.name}/${file.name}`,
        writable: false
      });
      
      files.push(file);
    } else if (entry.kind === 'directory') {
      const nestedPath = path ? `${path}/${dirHandle.name}` : dirHandle.name;
      const nestedFiles = await readDirectoryAsFiles(entry, nestedPath);
      files.push(...nestedFiles);
    }
  }
  
  return files;
}

export async function verifyPermission(fileHandle: any, readWrite = false): Promise<boolean> {
  const options = {
    mode: (readWrite ? 'readwrite' : 'read') as any,
  };

  // Check if we already have permission
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }

  // Request permission to the file
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }

  // The user did not grant permission
  return false;
}

export async function saveDirectoryHandle(courseId: string, handle: any) {
  await set(`course_dir_${courseId}`, handle);
}

export async function getDirectoryHandle(courseId: string): Promise<any | undefined> {
  return await get(`course_dir_${courseId}`);
}
