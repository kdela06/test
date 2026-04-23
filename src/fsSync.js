// Solo escritorio Chromium (File System Access API)
export const FS_META_FILENAME = 'metadatos_biblioteca.json';

export function isDesktopFSAvailable() {
  return typeof window !== 'undefined' && !!window.showDirectoryPicker;
}

export async function ensurePermission(dirHandle, mode = 'readwrite') {
  if (!dirHandle) return false;

  try {
    const q = await dirHandle.queryPermission({ mode });
    if (q === 'granted') return true;
    const r = await dirHandle.requestPermission({ mode });
    return r === 'granted';
  } catch {
    return false;
  }
}

// ---- Directorios ----
async function getOrCreateDirectory(parentHandle, name) {
  return await parentHandle.getDirectoryHandle(name, { create: true });
}

async function getDirectoryByFolderId(rootHandle, folderId) {
  // folderId null => root físico
  if (!folderId) return rootHandle;
  return await getOrCreateDirectory(rootHandle, `__folder_${folderId}`);
}

// ---- Metadatos ----
export async function readMeta(rootHandle) {
  try {
    const metaHandle = await rootHandle.getFileHandle(FS_META_FILENAME, { create: false });
    const file = await metaHandle.getFile();
    const text = await file.text();
    const data = JSON.parse(text);
    return data;
  } catch {
    return null;
  }
}

export async function writeMeta(rootHandle, meta) {
  const metaHandle = await rootHandle.getFileHandle(FS_META_FILENAME, { create: true });
  const writable = await metaHandle.createWritable();
  await writable.write(JSON.stringify(meta, null, 2));
  await writable.close();
}

// ---- Sincronizar (app -> disco) ----
export async function syncToDisk(rootHandle, { archivos, carpetas }) {
  // 1) crear carpetas físicas (una por id)
  for (const c of carpetas) {
    await getDirectoryByFolderId(rootHandle, c.id); // crea __folder_<id>
  }

  // 2) escribir archivos en su carpeta correspondiente
  for (const a of archivos) {
    const dir = await getDirectoryByFolderId(rootHandle, a.carpetaId || null);
    const fileHandle = await dir.getFileHandle(a.nombre, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(a.contenido ?? '');
    await writable.close();
  }

  // 3) escribir metadatos
  await writeMeta(rootHandle, {
    version: 1,
    updatedAt: new Date().toISOString(),
    carpetas,
    archivos: archivos.map(a => ({
      id: a.id,
      nombre: a.nombre,
      carpetaId: a.carpetaId ?? null
      // el contenido NO se guarda aquí; está en el archivo real
    }))
  });
}

// ---- Cargar (disco -> app) ----
export async function loadFromDisk(rootHandle) {
  const meta = await readMeta(rootHandle);

  // Si no hay metadatos, asumimos carpeta vacía "gestionada por app"
  if (!meta || !Array.isArray(meta.carpetas) || !Array.isArray(meta.archivos)) {
    return { carpetas: [], archivos: [] };
  }

  const carpetas = meta.carpetas;
  const archivos = [];

  for (const a of meta.archivos) {
    const dir = await getDirectoryByFolderId(rootHandle, a.carpetaId || null);

    try {
      const fh = await dir.getFileHandle(a.nombre, { create: false });
      const file = await fh.getFile();
      const content = await file.text();

      archivos.push({
        id: a.id ?? ('doc_' + Date.now() + Math.random()),
        nombre: a.nombre,
        contenido: content,
        carpetaId: a.carpetaId ?? null
      });
    } catch {
      // Si el archivo no existe, lo ignoramos (o podrías marcarlo)
    }
  }

  return { carpetas, archivos };
}