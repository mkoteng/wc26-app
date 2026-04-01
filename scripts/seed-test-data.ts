/**
 * Seed script — creates test users, a test league, and varied predictions
 * for verifying the scoring system.
 *
 * Run:
 *   npx dotenv-cli -e .env.local -- npx tsx scripts/seed-test-data.ts
 *
 * Optional env:
 *   SEED_REAL_USER_ID=<your-db-user-id>  — adds you as a member of the test league
 *
 * Test predictions are designed so that when you simulate the following results
 * in /dev, the scoring differs clearly across users:
 *   Match 0: 2-1  → Erik: 3pts (exact), Ola: 1pt (outcome), Kari: 0pts (wrong)
 *   Match 1: 1-0  → Erik: 3pts (exact), Ola: 3pts (exact), Kari: 0pts (wrong)
 *   Match 2: 3-1  → Erik: 3pts (exact), Ola: 1pt (outcome), Kari: 0pts (wrong)
 *   Match 3: 2-0  → Erik: 3pts (exact), Ola: 1pt (outcome), Kari: 0pts (wrong)
 *   Match 4: 1-1  → Erik: 3pts (exact), Ola: 0pts (wrong), Kari: 1pt (outcome)
 */

import { eq } from 'drizzle-orm'
import { getDb } from '../lib/db/index'
import {
  users,
  leagues,
  leagueMembers,
  predictions,
  tournamentWinnerPredictions,
} from '../lib/db/schema'
import { getMatches, getTeams } from '../lib/wc26'

const TEST_LEAGUE_ID = 'TESTLIGA'
const TEST_LEAGUE_INVITE = 'WC26-TEST'

const testUsers = [
  { id: 'test-user-1', name: 'Ola Nordmann', email: 'ola@test.wc26', image: null },
  { id: 'test-user-2', name: 'Kari Hansen', email: 'kari@test.wc26', image: null },
  { id: 'test-user-3', name: 'Erik Johansen', email: 'erik@test.wc26', image: null },
]

async function main() {
  const db = getDb()

  // 1. Upsert test users
  for (const user of testUsers) {
    await db
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.id,
        set: { name: user.name, email: user.email, image: user.image },
      })
  }
  console.log('✓ Test users upserted')

  // 2. Create test league (idempotent)
  await db
    .insert(leagues)
    .values({
      id: TEST_LEAGUE_ID,
      name: 'Test-liga VM 2026',
      inviteCode: TEST_LEAGUE_INVITE,
      createdBy: 'test-user-1',
    })
    .onConflictDoNothing()
  console.log('✓ Test league created (id: TESTLIGA, invite: WC26-TEST)')

  // 3. Add members — 3 test users + optional real user
  const memberIds = ['test-user-1', 'test-user-2', 'test-user-3']
  const realUserId = process.env.SEED_REAL_USER_ID
  if (realUserId) memberIds.push(realUserId)

  for (const userId of memberIds) {
    await db
      .insert(leagueMembers)
      .values({ leagueId: TEST_LEAGUE_ID, userId })
      .onConflictDoNothing()
  }
  console.log(`✓ Members added (${memberIds.length} total)`)

  // 4. Get first 5 matches sorted by date+time
  const first5 = [...getMatches()]
    .sort((a, b) => (a.date + a.time_utc).localeCompare(b.date + b.time_utc))
    .slice(0, 5)
  console.log(`✓ Using first 5 matches: ${first5.map((m) => m.id).join(', ')}`)

  // 5. Seed match predictions (varied for interesting scoring)
  //    test-user-3 (Erik):  all exact scores
  //    test-user-1 (Ola):   mostly correct outcomes, few exact
  //    test-user-2 (Kari):  mostly wrong, one correct outcome
  const userPredictions: Array<{ userId: string; preds: [number, number][] }> = [
    {
      userId: 'test-user-3',
      preds: [[2, 1], [1, 0], [3, 1], [2, 0], [1, 1]],
    },
    {
      userId: 'test-user-1',
      preds: [[1, 0], [1, 0], [2, 0], [1, 0], [0, 1]],
    },
    {
      userId: 'test-user-2',
      preds: [[0, 3], [0, 2], [0, 4], [0, 2], [0, 2]],
    },
  ]

  const now = new Date()
  for (const { userId, preds } of userPredictions) {
    for (let i = 0; i < first5.length; i++) {
      const match = first5[i]
      const [homeGoals, awayGoals] = preds[i]
      await db
        .insert(predictions)
        .values({
          id: `seed-${userId}-${match.id}`,
          userId,
          leagueId: TEST_LEAGUE_ID,
          matchId: match.id,
          homeGoals,
          awayGoals,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [predictions.userId, predictions.leagueId, predictions.matchId],
          set: { homeGoals, awayGoals, updatedAt: now },
        })
    }
  }
  console.log('✓ Match predictions seeded')

  // 6. Tournament winner predictions
  const allTeams = getTeams()
  const brazil = allTeams.find((t) => t.name === 'Brazil')
  const france = allTeams.find((t) => t.name === 'France')
  const argentina = allTeams.find((t) => t.name === 'Argentina')

  const winnerPreds = [
    { userId: 'test-user-1', teamId: brazil?.id ?? 'brazil' },
    { userId: 'test-user-2', teamId: france?.id ?? 'france' },
    { userId: 'test-user-3', teamId: argentina?.id ?? 'argentina' },
  ]

  for (const { userId, teamId } of winnerPreds) {
    await db
      .insert(tournamentWinnerPredictions)
      .values({
        id: `seed-winner-${userId}`,
        userId,
        leagueId: TEST_LEAGUE_ID,
        teamId,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [tournamentWinnerPredictions.userId, tournamentWinnerPredictions.leagueId],
        set: { teamId, updatedAt: now },
      })
  }
  console.log('✓ Tournament winner predictions seeded')
  console.log(`  Ola → ${brazil?.name ?? 'Brazil'} | Kari → ${france?.name ?? 'France'} | Erik → ${argentina?.name ?? 'Argentina'}`)

  console.log('\n✅ Seed complete!')
  console.log(`   League ID:    ${TEST_LEAGUE_ID}`)
  console.log(`   Invite code:  ${TEST_LEAGUE_INVITE}`)
  console.log(`   Dev dashboard: http://localhost:3000/dev`)
  if (!realUserId) {
    console.log('\n   Tip: set SEED_REAL_USER_ID=<id> to add yourself to the test league')
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
