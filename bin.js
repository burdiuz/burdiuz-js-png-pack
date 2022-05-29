/**
 * AS3 ByteArray API implementation
 */
export class ByteArray {
  constructor(buffer, initPosition = 0) {
    this.buffer = typeof buffer === "number" ? new Uint8Array(buffer) : buffer;
    this.position = initPosition;
  }

  get bytesAvailable() {
    return this.buffer.length - this.position;
  }

  get length() {
    return this.buffer.length;
  }

  toString(charset = "utf-8") {
    const decoder = new TextDecoder(charset);

    return decoder.decode(this.buffer);
  }

  readUnsignedByte() {
    return this.buffer[this.position++];
  }

  readUnsignedShort() {
    return (this.readUnsignedByte() << 8) | this.readUnsignedByte();
  }

  readUnsignedInt() {
    const value = (this.readUnsignedShort() << 16) | this.readUnsignedShort();

    return value >>> 0;
  }

  /**
   *
   * @param {*} bytes Target byte array where to write bytes
   * @param {*} offset Position defines where to start writing bytes into target
   * @param {*} length Abmount of bytes to read
   * @returns Target byte array
   */
  readBytes(bytes, offset = 0, length = 0) {
    if (!length) {
      length = this.bytesAvailable;
    }

    if (!bytes) {
      bytes = new ByteArray(offset + length);
    }

    let amountToRead = Math.min(this.bytesAvailable, length);

    bytes.position = offset;
    while (amountToRead > 0) {
      bytes.writeUnsignedByte(this.readUnsignedByte());
      amountToRead--;
    }

    return bytes;
  }

  readMultiByte(length, charSet = "utf-8") {
    const part = this.readBytes(null, 0, length);

    return part.toString(charSet);
  }

  writeUnsignedByte(value) {
    this.buffer[this.position++] = (value >>> 0) & 0xff;
  }

  writeUnsignedShort(value) {
    this.writeUnsignedByte(value >>> 8);
    this.writeUnsignedByte(value);
  }

  writeUnsignedInt(value) {
    this.writeUnsignedShort(value >>> 16);
    this.writeUnsignedShort(value);
  }

  /**
   *
   * @param {*} bytes Byte array, ource of the data
   * @param {*} offset Position from where to start reading
   * @param {*} length Length of data to read
   */
  writeBytes(bytes, offset = 0, length = 0) {
    const pos = bytes.position;
    bytes.position = offset;

    if (!length) {
      length = bytes.bytesAvailable;
    }

    while (length > 0) {
      this.writeUnsignedByte(bytes.readUnsignedByte());
      length--;
    }

    bytes.position = pos;
  }

  // charset not available for TextEncoder
  // it is utf-8 by default
  writeMultiByte(str) {
    this.writeBytes(ByteArray.fromString(str));
  }

  /**
   *
   * @param {*} string Only utf-8 strings servisable
   * @returns ByteArray
   */
  static fromString(string) {
    const decoder = new TextEncoder();

    const buffer = decoder.encode(string);

    return new ByteArray(buffer);
  }
}

/**
 *
 * CRC32 checksum
 * FIXME check if it works properly
 */

const CRC32 = {
  /** The fast CRC table. Computed once when the CRC32 class is loaded. */
  crcTable: (() => {
    const crcTable = new Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 8; --k >= 0; ) {
        if ((c & 1) != 0) c = 0xedb88320 ^ (c >>> 1);
        else c = c >>> 1;
      }
      crcTable[n] = c;
    }
    return crcTable;
  })(),

  /**
   * Adds the complete byte array to the data checksum.
   *
   * @param buf the buffer which contains the data
   */
  calculate(bytes) {
    let crc = 0;
    let off = 0;
    let len = bytes.length;
    //var c:uint = ~crc;
    while (--len >= 0)
      crc = CRC32.crcTable[(crc ^ bytes[off++]) & 0xff] ^ (crc >>> 8);
    //crc = ~crc;
    return crc;
  },
};

/**
 *
 * PNG Chunk
 *
 */

export class PNGChunk {
  constructor(type, content, crc = 0) {
    this.type = type;
    this.content = content;
    this.crc = crc ? crc : content ? CRC32.calculate(content) : 0;
  }

  setContent(value) {
    if (this._content != value) {
      this._content = value;
      this.calculateCRC();
    }
  }

  getContentLength() {
    return this.content ? this.content.length : 0;
  }

  getLength() {
    return 8 + this.type.length + this.getContentLength();
  }

  calculateCRC() {
    if (!this._content) return 0;

    const bytes = new ByteArray(this.type.length + this.getContentLength());

    bytes.writeMultiByte(this.type);
    bytes.writeBytes(this.content);

    this.crc = CRC32.calculate(bytes);
    return this.crc;
  }
  static read(bytes, offset) {
    if (isNaN(offset)) {
      offset = bytes.position;
    } else {
      bytes.position = offset;
    }

    const length = bytes.readUnsignedInt();

    let type = "";
    while (type.length < 4) {
      type += String.fromCharCode(bytes.readUnsignedByte());
    }

    const content = new ByteArray(length);

    if (length) {
      bytes.readBytes(content, 0, length);
    }

    const crc = bytes.readUnsignedInt();

    return new PNGChunk(type, content, crc);
  }

  static write(chunk, bytes = null) {
    const { type, content, crc } = chunk;

    if (!bytes) {
      /**
       * 4 bytes for length
       * + type header length (4 bytes)
       * + chunk length
       * + 4 bytes for CRC
       */
      bytes = new ByteArray(chunk.getLength());
    }

    const length = content.length;
    bytes.writeUnsignedInt(length);
    bytes.writeMultiByte(type);

    if (length) {
      bytes.writeBytes(content);
    }

    bytes.writeUnsignedInt(crc);
    return bytes;
  }
}

/**
 *
 * PNG File
 *
 */

const PNG_HEADER = new ByteArray(
  Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
);

const PNG_HEADER_LENGTH = 8;

export class PNGFile {
  constructor(chunks) {
    this.chunks = chunks;
  }

  setChunks(list) {
    if (this.chunks === list) {
      return;
    }

    this.chunks = list || [];
  }

  copy() {
    return new PNGFile(this.chunks.slice());
  }

  static read(bytes) {
    bytes.position = PNG_HEADER_LENGTH;
    const list = [];

    while (bytes.bytesAvailable > 0) {
      list.push(PNGChunk.read(bytes));
    }

    return new PNGFile(list);
  }

  static write(file, bytes) {
    let length = PNG_HEADER_LENGTH;

    const chunks = file.list.map((chunk) => {
      const chunkData = PNGChunk.write(chunk);

      length += chunkData.length;
      return chunkData;
    });

    if (!bytes) bytes = new ByteArray(length);

    bytes.writeBytes(PNG_HEADER);

    chunks.forEach((chunk) => {
      PNGChunk.write(chunk, bytes);
    });

    return bytes;
  }
}

/**
 *
 * PNG Util
 *
 */

export const PNGUtil = {
  readFile(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        res(reader.result);
      });
      reader.addEventListener("error", rej);
      reader.readAsArrayBuffer(file);
    });
  },
};
