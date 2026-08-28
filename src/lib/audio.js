const AudioCtx = window.AudioContext || window.webkitAudioContext
let ctx = null

function getCtx() {
  if (!ctx) ctx = new AudioCtx()
  return ctx
}

export function playBell() {
  const ac = getCtx()
  const now = ac.currentTime

  const fundamentals = [220, 277.18, 329.63, 440]
  const partials = [1, 2.02, 3.01, 4.03, 5.04]

  const masterGain = ac.createGain()
  masterGain.gain.setValueAtTime(0, now)
  masterGain.gain.linearRampToValueAtTime(0.5, now + 0.02)
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + 5)
  masterGain.connect(ac.destination)

  fundamentals.forEach(f => {
    partials.forEach((p, i) => {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      const amp = 0.3 / (i + 1)

      osc.type = 'sine'
      osc.frequency.setValueAtTime(f * p, now)

      gain.gain.setValueAtTime(amp, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 4 - i * 0.3)

      osc.connect(gain)
      gain.connect(masterGain)
      osc.start(now)
      osc.stop(now + 5)
    })
  })
}

export function resumeCtx() {
  if (ctx && ctx.state === 'suspended') ctx.resume()
}