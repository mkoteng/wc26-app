export type Prediction = {
  id: string
  userId: string
  leagueId: string
  matchId: string
  homeGoals: number
  awayGoals: number
  createdAt: Date | null
  updatedAt: Date | null
}

export type TournamentWinnerPrediction = {
  id: string
  userId: string
  leagueId: string
  teamId: string
  createdAt: Date | null
  updatedAt: Date | null
}

export type LeagueMember = {
  userId: string
  name: string
  image: string | null
  joinedAt: Date | null
}

export type LeagueStanding = {
  userId: string
  displayName: string
  image: string | null
  points: number
  exactScores: number
  correctOutcomes: number
  winnerPoints: number
  rank: number
}
