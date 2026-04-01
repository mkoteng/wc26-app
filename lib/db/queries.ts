import { eq, and, count, ilike, or, desc, sql } from 'drizzle-orm'
import { getDb } from './index'
import {
  users,
  leagues,
  leagueMembers,
  predictions,
  tournamentWinnerPredictions,
  adminOverrides,
} from './schema'

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateId(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(4))
  return 'WC26-' + Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function getUserById(id: string) {
  const db = getDb()
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return rows[0] ?? null
}

export async function upsertUser(user: {
  id: string
  name: string
  email: string
  image?: string | null
}) {
  const db = getDb()
  await db
    .insert(users)
    .values({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? null,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        name: user.name,
        email: user.email,
        image: user.image ?? null,
      },
    })
}

// ── Leagues ──────────────────────────────────────────────────────────────────

export async function createLeague(name: string, userId: string) {
  const db = getDb()
  const id = generateId(8)
  const inviteCode = generateInviteCode()

  await db.insert(leagues).values({ id, name, inviteCode, createdBy: userId })
  await db.insert(leagueMembers).values({ leagueId: id, userId })

  return { id, inviteCode }
}

export async function getAllLeagues() {
  const db = getDb()
  return db.select().from(leagues)
}

export async function getLeagueByInviteCode(code: string) {
  const db = getDb()
  const rows = await db
    .select()
    .from(leagues)
    .where(eq(leagues.inviteCode, code.toUpperCase()))
    .limit(1)
  return rows[0] ?? null
}

export async function getLeagueById(id: string) {
  const db = getDb()
  const rows = await db.select().from(leagues).where(eq(leagues.id, id)).limit(1)
  return rows[0] ?? null
}

export async function getLeaguesByUser(userId: string) {
  const db = getDb()
  const rows = await db
    .select({
      league: leagues,
      joinedAt: leagueMembers.joinedAt,
    })
    .from(leagueMembers)
    .innerJoin(leagues, eq(leagueMembers.leagueId, leagues.id))
    .where(eq(leagueMembers.userId, userId))
  return rows
}

export async function getLeagueMembers(leagueId: string) {
  const db = getDb()
  return db
    .select({
      userId: leagueMembers.userId,
      joinedAt: leagueMembers.joinedAt,
      name: users.name,
      image: users.image,
    })
    .from(leagueMembers)
    .innerJoin(users, eq(leagueMembers.userId, users.id))
    .where(eq(leagueMembers.leagueId, leagueId))
}

export async function isLeagueMember(leagueId: string, userId: string) {
  const db = getDb()
  const rows = await db
    .select()
    .from(leagueMembers)
    .where(and(eq(leagueMembers.leagueId, leagueId), eq(leagueMembers.userId, userId)))
    .limit(1)
  return rows.length > 0
}

export async function joinLeague(leagueId: string, userId: string) {
  const db = getDb()
  await db
    .insert(leagueMembers)
    .values({ leagueId, userId })
    .onConflictDoNothing()
}

// ── Predictions ──────────────────────────────────────────────────────────────

export async function upsertPrediction(pred: {
  userId: string
  leagueId: string
  matchId: string
  homeGoals: number
  awayGoals: number
}) {
  const db = getDb()
  const id = generateId(12)
  const now = new Date()
  await db
    .insert(predictions)
    .values({
      id,
      userId: pred.userId,
      leagueId: pred.leagueId,
      matchId: pred.matchId,
      homeGoals: pred.homeGoals,
      awayGoals: pred.awayGoals,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [predictions.userId, predictions.leagueId, predictions.matchId],
      set: {
        homeGoals: pred.homeGoals,
        awayGoals: pred.awayGoals,
        updatedAt: now,
      },
    })
}

export async function deletePrediction(userId: string, leagueId: string, matchId: string) {
  const db = getDb()
  await db
    .delete(predictions)
    .where(
      and(
        eq(predictions.userId, userId),
        eq(predictions.leagueId, leagueId),
        eq(predictions.matchId, matchId)
      )
    )
}

export async function getPredictionsByLeague(leagueId: string) {
  const db = getDb()
  return db.select().from(predictions).where(eq(predictions.leagueId, leagueId))
}

export async function getPredictionsByMatchId(matchId: string) {
  const db = getDb()
  return db.select().from(predictions).where(eq(predictions.matchId, matchId))
}

export async function getPredictionsWithUsersByMatchId(matchId: string) {
  const db = getDb()
  return db
    .select({
      userId: predictions.userId,
      matchId: predictions.matchId,
      homeGoals: predictions.homeGoals,
      awayGoals: predictions.awayGoals,
      displayName: users.name,
    })
    .from(predictions)
    .innerJoin(users, eq(predictions.userId, users.id))
    .where(eq(predictions.matchId, matchId))
}

export async function getPredictionsByUser(userId: string, leagueId: string) {
  const db = getDb()
  return db
    .select()
    .from(predictions)
    .where(
      and(eq(predictions.userId, userId), eq(predictions.leagueId, leagueId))
    )
}

// ── Tournament Winner Predictions ────────────────────────────────────────────

export async function upsertTournamentWinnerPrediction(
  userId: string,
  leagueId: string,
  teamId: string
) {
  const db = getDb()
  const id = generateId(12)
  const now = new Date()
  await db
    .insert(tournamentWinnerPredictions)
    .values({
      id,
      userId,
      leagueId,
      teamId,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [tournamentWinnerPredictions.userId, tournamentWinnerPredictions.leagueId],
      set: {
        teamId,
        updatedAt: now,
      },
    })
}

export async function getTournamentWinnerPredictions(leagueId: string) {
  const db = getDb()
  return db
    .select()
    .from(tournamentWinnerPredictions)
    .where(eq(tournamentWinnerPredictions.leagueId, leagueId))
}

// ── Admin queries ─────────────────────────────────────────────────────────────

export async function getAdminStats() {
  const db = getDb()
  const [userCount, leagueCount, predCount] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(leagues),
    db.select({ value: count() }).from(predictions),
  ])
  return {
    users: Number(userCount[0]?.value ?? 0),
    leagues: Number(leagueCount[0]?.value ?? 0),
    predictions: Number(predCount[0]?.value ?? 0),
  }
}

export async function getAllUsersAdmin(search?: string) {
  const db = getDb()
  const leagueCountSq = db
    .select({ userId: leagueMembers.userId, cnt: count().as('cnt') })
    .from(leagueMembers)
    .groupBy(leagueMembers.userId)
    .as('lc')

  const query = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      createdAt: users.createdAt,
      leagueCount: sql<number>`COALESCE(${leagueCountSq.cnt}, 0)`,
    })
    .from(users)
    .leftJoin(leagueCountSq, eq(users.id, leagueCountSq.userId))
    .orderBy(users.name)

  if (search) {
    return query.where(
      or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
    )
  }
  return query
}

export async function getUserAdmin(userId: string) {
  const db = getDb()
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  return rows[0] ?? null
}

export async function getUserLeaguesAdmin(userId: string) {
  const db = getDb()
  return db
    .select({
      league: leagues,
      joinedAt: leagueMembers.joinedAt,
    })
    .from(leagueMembers)
    .innerJoin(leagues, eq(leagueMembers.leagueId, leagues.id))
    .where(eq(leagueMembers.userId, userId))
    .orderBy(leagueMembers.joinedAt)
}

export async function getUserPredictionsAdmin(userId: string) {
  const db = getDb()
  return db
    .select({
      id: predictions.id,
      leagueId: predictions.leagueId,
      leagueName: leagues.name,
      matchId: predictions.matchId,
      homeGoals: predictions.homeGoals,
      awayGoals: predictions.awayGoals,
      updatedAt: predictions.updatedAt,
    })
    .from(predictions)
    .innerJoin(leagues, eq(predictions.leagueId, leagues.id))
    .where(eq(predictions.userId, userId))
    .orderBy(desc(predictions.updatedAt))
}

export async function getAllLeaguesAdmin(search?: string) {
  const db = getDb()
  const memberCountSq = db
    .select({ leagueId: leagueMembers.leagueId, cnt: count().as('cnt') })
    .from(leagueMembers)
    .groupBy(leagueMembers.leagueId)
    .as('mc')

  const query = db
    .select({
      id: leagues.id,
      name: leagues.name,
      inviteCode: leagues.inviteCode,
      createdAt: leagues.createdAt,
      createdBy: leagues.createdBy,
      creatorName: users.name,
      memberCount: sql<number>`COALESCE(${memberCountSq.cnt}, 0)`,
    })
    .from(leagues)
    .leftJoin(users, eq(leagues.createdBy, users.id))
    .leftJoin(memberCountSq, eq(leagues.id, memberCountSq.leagueId))
    .orderBy(desc(leagues.createdAt))

  if (search) {
    return query.where(
      or(ilike(leagues.name, `%${search}%`), ilike(leagues.inviteCode, `%${search}%`))
    )
  }
  return query
}

export async function getLeagueMembersAdmin(leagueId: string) {
  const db = getDb()
  return db
    .select({
      userId: leagueMembers.userId,
      joinedAt: leagueMembers.joinedAt,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(leagueMembers)
    .innerJoin(users, eq(leagueMembers.userId, users.id))
    .where(eq(leagueMembers.leagueId, leagueId))
    .orderBy(users.name)
}

export async function getLeaguePredictionsAdmin(leagueId: string) {
  const db = getDb()
  return db
    .select({
      id: predictions.id,
      userId: predictions.userId,
      userName: users.name,
      matchId: predictions.matchId,
      homeGoals: predictions.homeGoals,
      awayGoals: predictions.awayGoals,
      updatedAt: predictions.updatedAt,
    })
    .from(predictions)
    .innerJoin(users, eq(predictions.userId, users.id))
    .where(eq(predictions.leagueId, leagueId))
    .orderBy(users.name, predictions.matchId)
}

export async function getLeagueWinnerPredictionsAdmin(leagueId: string) {
  const db = getDb()
  return db
    .select({
      id: tournamentWinnerPredictions.id,
      userId: tournamentWinnerPredictions.userId,
      userName: users.name,
      teamId: tournamentWinnerPredictions.teamId,
      updatedAt: tournamentWinnerPredictions.updatedAt,
    })
    .from(tournamentWinnerPredictions)
    .innerJoin(users, eq(tournamentWinnerPredictions.userId, users.id))
    .where(eq(tournamentWinnerPredictions.leagueId, leagueId))
    .orderBy(users.name)
}

export async function updatePredictionById(
  id: string,
  homeGoals: number,
  awayGoals: number
) {
  const db = getDb()
  await db
    .update(predictions)
    .set({ homeGoals, awayGoals, updatedAt: new Date() })
    .where(eq(predictions.id, id))
}

export async function removeUserFromLeague(leagueId: string, userId: string) {
  const db = getDb()
  await db
    .delete(predictions)
    .where(and(eq(predictions.leagueId, leagueId), eq(predictions.userId, userId)))
  await db
    .delete(tournamentWinnerPredictions)
    .where(
      and(
        eq(tournamentWinnerPredictions.leagueId, leagueId),
        eq(tournamentWinnerPredictions.userId, userId)
      )
    )
  await db
    .delete(leagueMembers)
    .where(
      and(eq(leagueMembers.leagueId, leagueId), eq(leagueMembers.userId, userId))
    )
}

export async function insertAdminOverride(entry: {
  adminEmail: string
  action: string
  targetId: string
  details?: Record<string, unknown>
  reason?: string
}) {
  const db = getDb()
  const id = generateId(16)
  await db.insert(adminOverrides).values({
    id,
    adminEmail: entry.adminEmail,
    action: entry.action,
    targetId: entry.targetId,
    details: entry.details ?? null,
    reason: entry.reason ?? null,
  })
}

export async function getAdminOverrides(actionFilter?: string) {
  const db = getDb()
  const query = db
    .select()
    .from(adminOverrides)
    .orderBy(desc(adminOverrides.createdAt))
    .limit(200)

  if (actionFilter) {
    return query.where(eq(adminOverrides.action, actionFilter))
  }
  return query
}
