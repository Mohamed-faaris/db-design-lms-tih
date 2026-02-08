import {
  index,
  pgTableCreator,
  pgEnum,
  uniqueIndex,
  pgTable,
  primaryKey,
} from "drizzle-orm/pg-core";

/* -------------------- TYPES -------------------- */


/**
 * Multi-project schema creator
 */

export const createTable = pgTableCreator(
  (name) => `Learning_portal_${name}`
);


/* 1. Managers (needs roles enum) */
export const rolesEnum = pgEnum("roles", ["superAdmin", "admin", "manager", "staff"]);

export const college = pgEnum("college", ["krce", "krct", "mkce"])

export const department = pgEnum("department", ["CSE", "EEE", "ECE", "AI", "AIDS"])

export const videoEvents = pgEnum("video_events", ["pause", "stop", "start"])

export const notificationsStatus = pgEnum("notifications_status", ["active", "viewed", "delete"])


/* -------------------- AUTH TABLES -------------------- */

export const user = pgTable("user", (d) => ({
  id: d.text().primaryKey(),
  name: d.text().notNull(),
  college: college("college").notNull(),
  department: department("department").notNull(),
  role: rolesEnum("role").notNull(),
  email: d.text().notNull().unique(),
  emailVerified: d.boolean().default(false).notNull(),
  image: d.text(),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}), (t) => ({
  collegeIdx: index('college_dept_id_idx').on(t.college, t.department, t.name, t.role, t.email, t.id)
}));

export const session = pgTable("session", (d) => ({
  id: d.text().primaryKey(),
  expiresAt: d.timestamp().notNull(),
  token: d.text().notNull().unique(),
  createdAt: d.timestamp().notNull(),
  updatedAt: d.timestamp().notNull(),
  ipAddress: d.text(),
  userAgent: d.text(),
  userId: d.text().notNull().references(() => user.id, { onDelete: "cascade" }),
}));

export const account = pgTable("account", (d) => ({
  id: d.text().primaryKey(),
  accountId: d.text().notNull(),
  providerId: d.text().notNull(),
  userId: d.text().notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: d.text(),
  refreshToken: d.text(),
  idToken: d.text(),
  accessTokenExpiresAt: d.timestamp(),
  refreshTokenExpiresAt: d.timestamp(),
  scope: d.text(),
  password: d.text(),
  createdAt: d.timestamp().notNull(),
  updatedAt: d.timestamp().notNull(),
}));

export const verification = pgTable("verification", (d) => ({
  id: d.text().primaryKey(),
  identifier: d.text().notNull(),
  value: d.text().notNull(),
  expiresAt: d.timestamp().notNull(),
  createdAt: d.timestamp().defaultNow(),
  updatedAt: d.timestamp().defaultNow(),
}));


/* -------------------- TABLES -------------------- */



export const userMeta = pgTable("user_meta", (d) => ({
  userId: d.text().notNull().references(() => user.id, { onDelete: "cascade" }).primaryKey(),
  phone_number: d.text(),
  address: d.text(),
  // Add other metadata fields as needed

  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}));

export const course = pgTable("course", (d) => ({
  id: d.serial().primaryKey(),
  title: d.text().notNull(),
  description: d.text(),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}));

export const content = pgTable("content", (d) => ({
  id: d.serial().primaryKey(),
  courseId: d.integer().notNull().references(() => course.id, { onDelete: "cascade" }),
  order: d.integer().notNull(),
  title: d.text().notNull(),
  body: d.text(),
  videoId: d.text().notNull(),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}));

export const comments = pgTable("comments", (d) => ({
  id: d.serial().primaryKey(),
  contentId: d.integer().notNull().references(() => content.id, { onDelete: "cascade" }),
  parentCommentId: d.integer(),
  userId: d.text().notNull().references(() => user.id, { onDelete: "cascade" }),
  commentText: d.text().notNull(),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}), (t) => ({
  parentReference: index('parent_comment_idx').on(t.parentCommentId)
}));


export const endQuiz = pgTable("end_quiz", (d) => ({
  id: d.serial().primaryKey(),
  contentId: d.integer().notNull().references(() => content.id, { onDelete: "cascade" }),
  question: d.jsonb().notNull(),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}));

export const modelQuiz = pgTable("model_quiz_", (d) => ({
  id: d.serial().primaryKey(),
  contentId: d.integer().notNull().references(() => content.id, { onDelete: "cascade" }),
  timeStamp: d.integer().notNull(), //in seconds
  question: d.jsonb().notNull(),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}));

export const quizAttempts = pgTable("quiz_attempts", (d) => ({
  id: d.serial().primaryKey(),
  userId: d.text().notNull().references(() => user.id, { onDelete: "cascade" }),
  quizId: d.integer().notNull().references(() => endQuiz.id, { onDelete: "cascade" }),
  score: d.integer().notNull(),
  attemptedAt: d.timestamp().defaultNow().notNull(),
}));


export const enrollments = pgTable("enrollments", (d) => ({
  userId: d.text().notNull().references(() => user.id, { onDelete: "cascade" }),
  enrolledBy: d.text().notNull().references(() => user.id),
  courseId: d.integer().notNull().references(() => course.id, { onDelete: "cascade" }),
  deadline: d.integer().default(0),//in days // 0 means no deadline 
  enrolledAt: d.timestamp().defaultNow().notNull(),
}), (t) => ({
  pk: primaryKey({ columns: [t.userId, t.courseId] }),
}));

export const progress = pgTable("progress", (d) => ({
  userId: d.text().notNull().references(() => user.id, { onDelete: "cascade" }),
  contentId: d.integer().notNull().references(() => content.id, { onDelete: "cascade" }),
  completedAt: d.timestamp().defaultNow().notNull(),
}), (t) => ({
  pk: primaryKey({ columns: [t.userId, t.contentId] }),
}));

export const feedback = pgTable("feedback", (d) => ({
  id: d.serial().primaryKey(),
  userId: d.text().notNull().references(() => user.id, { onDelete: "cascade" }),
  courseId: d.integer().notNull().references(() => course.id, { onDelete: "cascade" }),
  rating: d.integer(),
  comments: d.text(),
  createdAt: d.timestamp().defaultNow().notNull(),
}));

export const speedLogs = pgTable("speed_logs", (d) => ({
  id: d.serial().primaryKey(),
  userId: d.text().notNull().references(() => user.id, { onDelete: "cascade" }),
  contentId: d.integer().notNull().references(() => content.id, { onDelete: "cascade" }),
  event: videoEvents("event").notNull(),
  speed: d.integer(),//round(speed * 100)
  loggedAt: d.timestamp().defaultNow().notNull(),
}));


// gamification tables 

export const streak = pgTable("streak", (d) => ({
  userId: d.text().notNull().references(() => user.id, { onDelete: "cascade" }),
  count: d.integer().notNull(),
  date: d.date().notNull(),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}), (t) => ({
  pk: primaryKey({ columns: [t.userId, t.date] })
}));


export const xp = pgTable("xp", (d) => ({
  userId: d.text().notNull().references(() => user.id, { onDelete: "cascade" }).primaryKey(),
  xp: d.integer().notNull(),
}));

export const xpLog = pgTable("xp_log", (d) => ({
  id: d.serial().primaryKey(),
  userId: d.text().notNull().references(() => user.id, { onDelete: "cascade" }),
  xpChange: d.integer().notNull(),
  reason: d.text().notNull(),
  createdAt: d.timestamp().defaultNow().notNull(),
}));

export const badge = pgTable("badge", (d) => ({
  id: d.serial().primaryKey(),
  image: d.text(),
  title: d.text().unique(),
  description: d.text(),
  conditions: d.jsonb()
}))

export const badgeAssignment = pgTable("badge_assignment", (d) => ({
  userId: d.text().notNull().references(() => user.id, { onDelete: "cascade" }),
  badgeId: d.integer().notNull().references(() => badge.id, { onDelete: "cascade" }),
  assignedAt: d.timestamp().defaultNow().notNull(),
}), (t) => ({
  pk: primaryKey({ columns: [t.userId, t.badgeId] })
})
)

export const notifications = pgTable("notifications", (d) => ({
  id: d.serial().primaryKey(),
  userId: d.text().notNull().references(() => user.id, { onDelete: "cascade" }),
  subject: d.text().notNull(),
  description: d.text(),
  status: notificationsStatus("status").notNull().default("active"),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}))
