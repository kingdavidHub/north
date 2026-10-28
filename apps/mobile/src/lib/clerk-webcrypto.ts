/**
 * Expo Go / React Native do not provide the WebCrypto `crypto.subtle` API.
 * Clerk's headless native client uses `crypto.subtle.digest("sha-1", …)` to
 * derive its development cookie suffix. Without it, Clerk's dev-instance
 * bootstrap falls back to a browser-only chunk loader and crashes with
 * "Property 'document' doesn't exist".
 *
 * This polyfill implements only the one digest Clerk asks for.
 */

type BinaryLike = ArrayBuffer | ArrayBufferView;

function toBytes(data: BinaryLike): Uint8Array {
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
}

function sha1(bytes: Uint8Array): Uint8Array {
  const bitLength = bytes.length * 8;
  const paddedLength = (((bytes.length + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);
  view.setUint32(paddedLength - 4, bitLength >>> 0, false);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;
  const words = new Uint32Array(80);

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      words[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 80; i += 1) {
      const word =
        words[i - 3] ^ words[i - 8] ^ words[i - 14] ^ words[i - 16];
      words[i] = (word << 1) | (word >>> 31);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let i = 0; i < 80; i += 1) {
      let f: number;
      let k: number;
      if (i < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (i < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp =
        (((a << 5) | (a >>> 27)) + f + e + k + words[i]) >>> 0;
      e = d;
      d = c;
      c = ((b << 30) | (b >>> 2)) >>> 0;
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const digest = new Uint8Array(20);
  const digestView = new DataView(digest.buffer);
  digestView.setUint32(0, h0, false);
  digestView.setUint32(4, h1, false);
  digestView.setUint32(8, h2, false);
  digestView.setUint32(12, h3, false);
  digestView.setUint32(16, h4, false);
  return digest;
}

const subtle = {
  async digest(algorithm: AlgorithmIdentifier, data: BinaryLike): Promise<ArrayBuffer> {
    const name =
      typeof algorithm === "string" ? algorithm : (algorithm.name ?? "");
    if (name.toLowerCase() !== "sha-1") {
      throw new Error(`Unsupported digest algorithm: ${name}`);
    }
    const digest = sha1(toBytes(data));
    const buffer = new ArrayBuffer(digest.byteLength);
    new Uint8Array(buffer).set(digest);
    return buffer;
  },
};

const cryptoObject = globalThis.crypto ?? ({} as Crypto);

if (!cryptoObject.subtle) {
  Object.defineProperty(cryptoObject, "subtle", {
    configurable: true,
    value: subtle,
  });
}

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: cryptoObject,
  });
}

// Clerk's native client uses browser APIs for session cookies, the
// development-browser bootstrap, and tab locks. React Native exposes `window`
// but not the DOM, so provide only the pieces the headless client touches.
const windowObject =
  (globalThis as { window?: typeof globalThis }).window ?? globalThis;

if (typeof windowObject.addEventListener !== "function") {
  Object.defineProperty(windowObject, "addEventListener", {
    configurable: true,
    value: () => {},
  });
}

if (typeof windowObject.removeEventListener !== "function") {
  Object.defineProperty(windowObject, "removeEventListener", {
    configurable: true,
    value: () => {},
  });
}

const windowRecord = windowObject as unknown as Record<string, unknown>;
const cookieJar = new Map<string, string>();

const documentObject: Record<string, unknown> = {
  addEventListener: () => {},
  removeEventListener: () => {},
  // Clerk only persists the session cookie when the current context has
  // focus. Expo Go has no tabs, so treat the app as always focused.
  hasFocus: () => true,
  visibilityState: "visible",
  baseURI:
    (windowRecord.location as { href?: string } | undefined)?.href ??
    "http://localhost/",
};

Object.defineProperty(documentObject, "cookie", {
  configurable: true,
  get() {
    return Array.from(cookieJar, ([name, value]) => `${name}=${value}`).join(
      "; ",
    );
  },
  set(rawCookie: unknown) {
    const [pair] = String(rawCookie).split(";");
    const separator = pair.indexOf("=");
    if (separator <= 0) return;

    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1);
    if (value) {
      cookieJar.set(name, value);
    } else {
      cookieJar.delete(name);
    }
  },
});

if (typeof windowRecord.document === "undefined") {
  Object.defineProperty(windowObject, "document", {
    configurable: true,
    value: documentObject,
  });
}

if (
  windowObject !== globalThis &&
  typeof (globalThis as unknown as Record<string, unknown>).document ===
    "undefined"
) {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: documentObject,
  });
}

type MemoryStorage = {
  readonly length: number;
  clear: () => void;
  getItem: (key: string) => string | null;
  key: (index: number) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, value: string) => void;
};

function createMemoryStorage(): MemoryStorage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(String(key)) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => {
      values.delete(String(key));
    },
    setItem: (key, value) => {
      values.set(String(key), String(value));
    },
  };
}

for (const name of ["localStorage", "sessionStorage"] as const) {
  if (typeof windowRecord[name] === "undefined") {
    Object.defineProperty(windowObject, name, {
      configurable: true,
      value: createMemoryStorage(),
    });
  }
}
