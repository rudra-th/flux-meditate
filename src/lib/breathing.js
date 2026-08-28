const ph = (key, secs, note) => ({ key, secs, note })

export const BREATH_MODES = [
  {
    id: 'box',
    name: 'Box',
    tag: 'Focus & steady',
    note: 'The 4-4-4-4 rhythm used by astronauts and special forces to stay calm and focused under pressure.',
    rounds: 8,
    phases: [
      ph('inhale', 4, 'Breathe in slowly through your nose'),
      ph('hold', 4, 'Gently hold the fullness'),
      ph('exhale', 4, 'Release slowly and fully'),
      ph('hold', 4, 'Rest in the quiet emptiness')
    ]
  },
  {
    id: 'relax',
    name: 'Relax',
    tag: 'Wind down · sleep',
    note: 'Dr. Weil’s 4-7-8 breath — a natural tranquilizer that eases the heart rate and invites sleep.',
    rounds: 6,
    phases: [
      ph('inhale', 4, 'Breathe in quietly through your nose'),
      ph('hold', 7, 'Hold gently — no strain'),
      ph('exhale', 8, 'Whoosh out slowly through the mouth')
    ]
  },
  {
    id: 'sigh',
    name: 'Calm',
    tag: 'Instantly de-stress',
    note: 'The physiological sigh — a double-length exhale your body already uses to melt stress and settle panic fast.',
    rounds: 12,
    phases: [
      ph('inhale', 2, 'A quick sip of air through the nose'),
      ph('exhale', 6, 'A long, slow sigh — twice as long as the inhale')
    ]
  },
  {
    id: 'coherent',
    name: 'Coherent',
    tag: 'Even rhythm · HRV',
    note: 'Resonant breathing — six seconds in, six seconds out — the rhythm that balances heart-rate variability.',
    rounds: 10,
    phases: [
      ph('inhale', 6, 'In through your nose, soft and even'),
      ph('exhale', 6, 'Out through the nose, just as even')
    ]
  },
  {
    id: 'energy',
    name: 'Energize',
    tag: 'Wake up',
    note: 'A brisk, steady pace that gently oxygenates the body and lifts alertness without the jitters.',
    rounds: 12,
    phases: [
      ph('inhale', 4, 'Fill fully — chest and belly'),
      ph('exhale', 4, 'Pursed lips, steady stream out')
    ]
  }
]

export const patternString = (mode) => mode.phases.map(p => p.secs).join('-')

export const cycleLength = (mode) => mode.phases.reduce((sum, p) => sum + p.secs, 0)