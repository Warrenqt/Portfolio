import { PARTICLE_DURATION } from './portraitParticles'

export const INTRO_KEY = 'warren:intro:v3'
export const LETTER_DURATION = 2100
export const INTRO_DURATION = LETTER_DURATION + PARTICLE_DURATION

export function shouldPlayIntro(storage, reducedMotion, hash = '') {
  if (reducedMotion || (hash && hash !== '#home')) return false
  try { return storage.getItem(INTRO_KEY) !== 'seen' } catch { return false }
}

export function markIntroSeen(storage) {
  try { storage.setItem(INTRO_KEY, 'seen') } catch { /* Storage may be disabled. */ }
}
