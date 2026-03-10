'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiCelebrationProps {
  trigger: boolean
}

export function ConfettiCelebration({ trigger }: ConfettiCelebrationProps) {
  useEffect(() => {
    if (trigger) {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [trigger])

  return null
}
