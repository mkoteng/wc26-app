import type { Prediction, TournamentWinnerPrediction, LeagueMember, LeagueStanding } from '@/types/predictions'

type MatchResult = { homeGoals: number; awayGoals: number }

export function getOutcome(home: number, away: number): 'home' | 'draw' | 'away' {
  if (home > away) return 'home'
  if (home < away) return 'away'
  return 'draw'
}

/**
 * Exact score: 3 points
 * Correct outcome: 1 point
 * Wrong: 0 points
 */
export function calculatePoints(
  prediction: { homeGoals: number; awayGoals: number },
  result: { homeGoals: number; awayGoals: number }
): number {
  if (
    prediction.homeGoals === result.homeGoals &&
    prediction.awayGoals === result.awayGoals
  ) {
    return 3
  }
  return getOutcome(prediction.homeGoals, prediction.awayGoals) ===
    getOutcome(result.homeGoals, result.awayGoals)
    ? 1
    : 0
}

/** Correct winner picked before deadline: 5 points */
export function calculateTournamentWinnerPoints(
  predictedTeamId: string | null,
  actualWinnerTeamId: string | null
): number {
  if (!predictedTeamId || !actualWinnerTeamId) return 0
  return predictedTeamId === actualWinnerTeamId ? 5 : 0
}

/**
 * Calculate full standings for a league.
 * Sort: points desc → exactScores desc → correctOutcomes desc
 */
export function calculateStandings(
  members: LeagueMember[],
  allPredictions: Prediction[],
  results: Map<string, MatchResult>,
  winnerPredictions: TournamentWinnerPrediction[],
  actualWinner: string | null
): LeagueStanding[] {
  const winnerMap = new Map(winnerPredictions.map((wp) => [wp.userId, wp.teamId]))

  const standings: LeagueStanding[] = members.map((member) => {
    const userPreds = allPredictions.filter((p) => p.userId === member.userId)

    let matchPoints = 0
    let exactScores = 0
    let correctOutcomes = 0

    for (const pred of userPreds) {
      const result = results.get(pred.matchId)
      if (!result) continue
      const pts = calculatePoints(pred, result)
      matchPoints += pts
      if (pts === 3) exactScores++
      else if (pts === 1) correctOutcomes++
    }

    const winnerPts = calculateTournamentWinnerPoints(
      winnerMap.get(member.userId) ?? null,
      actualWinner
    )

    return {
      userId: member.userId,
      displayName: member.name,
      image: member.image,
      points: matchPoints + winnerPts,
      exactScores,
      correctOutcomes,
      winnerPoints: winnerPts,
      rank: 0,
    }
  })

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.exactScores !== a.exactScores) return b.exactScores - a.exactScores
    return b.correctOutcomes - a.correctOutcomes
  })

  standings.forEach((s, i) => {
    s.rank = i + 1
  })

  return standings
}
