'use client'

import { Trophy, Flame, Star } from 'lucide-react'
import { GamificationStats } from '@/lib/types'

interface GamificationWidgetProps {
  stats: GamificationStats
}

export function GamificationWidget({ stats }: GamificationWidgetProps) {
  const badgeEmojis: Record<string, string> = {
    'Starter': '🌱',
    'Saver': '💸',
    'Spender': '💰',
    'Budget Master': '🎯',
    'Consistent Tracker': '📊',
    'Frugal King': '👑',
    'Ultra Saver': '🌟',
  }

  return (
    <div className="space-y-6 p-4">
      <div className="bg-background/50 rounded-2xl p-6 border border-border/50">
        <h3 className="text-lg font-bold tracking-tight mb-6 flex items-center gap-2">
          <Flame className="text-accent" size={24} />
          Streak & Level
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-center transition-transform hover:scale-105">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Current</p>
              <p className="text-2xl font-bold text-accent">{stats.currentStreak} <span className="text-sm">days</span></p>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-center transition-transform hover:scale-105">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Longest</p>
              <p className="text-2xl font-bold text-primary">{stats.longestStreak} <span className="text-sm">days</span></p>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-center transition-transform hover:scale-105">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Level</p>
              <p className="text-2xl font-bold text-primary">{stats.level}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-muted-foreground">Experience Points</span>
              <span className="text-primary">{stats.points} <span className="text-muted-foreground">/ 500 XP</span></span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden border border-border/50">
              <div
                className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(stats.points / 500) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {stats.badges.length > 0 && (
        <div className="bg-background/50 rounded-2xl p-6 border border-border/50">
          <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
            <Trophy className="text-primary" size={24} />
            Badges Earned
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.badges.map(badge => (
              <div key={badge} className="bg-accent/10 hover:bg-accent/20 transition-colors border border-accent/20 rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="text-xl">{badgeEmojis[badge] || '⭐'}</span>
                <span className="font-semibold text-sm tracking-tight">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
