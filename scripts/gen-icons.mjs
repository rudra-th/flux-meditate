import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public')

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  const raw = Buffer.alloc(height * (1 + width * 4))
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0
    for (let x = 0; x < width * 4; x++) {
      raw[y * (1 + width * 4) + 1 + x] = rgba[y * width * 4 + x]
    }
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ])
}

function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

// Rounded-rect signed distance
function roundRectSDF(px, py, cx, cy, hw, hh, r) {
  const x = Math.abs(px - cx)
  const y = Math.abs(py - cy)
  const qx = x - (hw - r)
  const qy = y - (hh - r)
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r
  const inside = Math.min(Math.max(qx, qy), 0)
  return outside + inside
}

function buildIcon(size, opts = {}) {
  const maskable = !!opts.maskable
  const bgColor = maskable ? [20, 20, 43] : null
  const bgTop = [38, 38, 66]
  const bgBottom = [20, 20, 43]
  const amberTop = [240, 179, 90]
  const amberBottom = [212, 149, 60]
  const ringColor = [233, 168, 78]

  const cx = size / 2
  const cy = size / 2
  const inset = maskable ? size * 0.06 : size * 0.1
  const outer = maskable ? size * 0.46 : size * 0.42
  const thickness = size * 0.055
  const r0 = outer - thickness / 2
  const r1 = outer + thickness / 2
  const aa = 1.4
  const corner = size * 0.18

  const rgba = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5
      const py = y + 0.5
      const i = (y * size + x) * 4
      let r = bgTop[0], g = bgTop[1], b = bgTop[2], a = 255

      if (!maskable) {
        const sdf = roundRectSDF(px, py, cx, cy, size / 2 - inset, size / 2 - inset, corner)
        const cover = Math.max(0, Math.min(1, 0.5 - sdf))
        if (cover <= 0) {
          rgba[i] = rgba[i + 1] = rgba[i + 2] = 0
          rgba[i + 3] = 0
          continue
        }
        a = Math.round(cover * 255)
      }

      const grad = lerp(bgTop, bgBottom, py / size)
      r = grad[0]; g = grad[1]; b = grad[2]

      const dist = Math.hypot(px - cx, py - cy)
      const edge = Math.min(
        Math.max(0, Math.min(1, (r1 - dist) / aa)),
        Math.max(0, Math.min(1, (dist - r0) / aa))
      )
      if (edge > 0) {
        const cg = lerp(amberTop, amberBottom, py / size)
        r = cg[0]; g = cg[1]; b = cg[2]
      }

      const glow = dist > r1 ? Math.exp(-(dist - r1) / (size * 0.09)) * 0.5 : 0
      if (glow > 0.01) {
        r = Math.round(ringColor[0] * glow + r * (1 - glow))
        g = Math.round(ringColor[1] * glow + g * (1 - glow))
        b = Math.round(ringColor[2] * glow + b * (1 - glow))
      }

      if (edge > 0 && edge < 1) {
        const blend = edge
        const cg = lerp(amberTop, amberBottom, py / size)
        r = cg[0] * blend + r * (1 - blend)
        g = cg[1] * blend + g * (1 - blend)
        b = cg[2] * blend + b * (1 - blend)
      }

      rgba[i] = Math.round(r)
      rgba[i + 1] = Math.round(g)
      rgba[i + 2] = Math.round(b)
      rgba[i + 3] = a
    }
  }

  return encodePNG(size, size, rgba)
}

mkdirSync(OUT, { recursive: true })

const files = {
  'icon-192.png': 192,
  'icon-512.png': 512,
  'maskable-192.png': [192, { maskable: true }],
  'maskable-512.png': [512, { maskable: true }],
  'apple-touch-icon.png': 180,
  'favicon.png': 64
}

for (const [name, spec] of Object.entries(files)) {
  const size = Array.isArray(spec) ? spec[0] : spec
  const opts = Array.isArray(spec) ? spec[1] : {}
  writeFileSync(join(OUT, name), buildIcon(size, opts))
  console.log(`Generated ${name} (${size}x${size})`)
}

console.log('PWA icons ready in public/')