import { pgTable, text, integer, timestamp, primaryKey, unique, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const leagues = pgTable('leagues', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  inviteCode: text('invite_code').notNull().unique(),
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
})

export const leagueMembers = pgTable(
  'league_members',
  {
    leagueId: text('league_id')
      .notNull()
      .references(() => leagues.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    joinedAt: timestamp('joined_at').defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.leagueId, t.userId] })]
)

export const predictions = pgTable(
  'predictions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    leagueId: text('league_id')
      .notNull()
      .references(() => leagues.id),
    matchId: text('match_id').notNull(),
    homeGoals: integer('home_goals').notNull(),
    awayGoals: integer('away_goals').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => [unique().on(t.userId, t.leagueId, t.matchId)]
)

export const tournamentWinnerPredictions = pgTable(
  'tournament_winner_predictions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    leagueId: text('league_id')
      .notNull()
      .references(() => leagues.id),
    teamId: text('team_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => [unique().on(t.userId, t.leagueId)]
)

export const adminOverrides = pgTable('admin_overrides', {
  id: text('id').primaryKey(),
  adminEmail: text('admin_email').notNull(),
  action: text('action').notNull(),
  targetId: text('target_id').notNull(),
  details: jsonb('details'),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
})
