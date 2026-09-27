// Reuse an operation key after a transport retry or refresh. The session version
// remains the server's protection against advancing a turn twice.
export function getMutationKey(storage, storageKey, action, body, createKey = () => crypto.randomUUID()) {
  const signature = JSON.stringify({ action, body });
  const saved = storage.getItem(storageKey);
  if (saved) {
    try {
      const previous = JSON.parse(saved);
      if (previous.signature === signature && typeof previous.key === 'string') return previous.key;
    } catch {
      storage.removeItem(storageKey);
    }
  }
  const key = createKey();
  storage.setItem(storageKey, JSON.stringify({ key, signature }));
  return key;
}
