import {
  index,
  pgTableCreator,
  pgEnum,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";

/* -------------------- TYPES -------------------- */

/**
 * Multi-project schema creator
 */

export const createTable = pgTableCreator((name) => `Learning_portal_${name}`);

/* 1. Managers (needs roles enum) */
export const rolesEnum = pgEnum("roles", [
  "superAdmin",
  "admin",
  "manager",
  "faculty",
]);

export const college = pgEnum("college", ["krce", "krct", "mkce"]);

export const department = pgEnum("department", [
  "CSE",
  "EEE",
  "ECE",
  "AI",
  "AIDS",
]);

export const videoEvents = pgEnum("video_events", ["pause", "stop", "start"]);

export const notificationsStatus = pgEnum("notifications_status", [
  "active",
  "viewed",
  "deleted",
]);

export const contentTypeEnum = pgEnum("content_type", [
  "video",
  "article",
  "ppt",
]);

/* -------------------- AUTH TABLES -------------------- */

export const user = createTable(
  "user",
  (d) => ({
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
  }),
  (t) => ({
    collegeIdx: index("user_idx").on(
      t.college,
      t.department,
      t.name,
      t.role,
      t.email,
      t.id,
    ),
  }),
);

export const session = createTable("session", (d) => ({
  id: d.text().primaryKey(),
  expiresAt: d.timestamp().notNull(),
  token: d.text().notNull().unique(),
  createdAt: d.timestamp().notNull(),
  updatedAt: d.timestamp().notNull(),
  ipAddress: d.text(),
  userAgent: d.text(),
  userId: d
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
}));

export const account = createTable("account", (d) => ({
  id: d.text().primaryKey(),
  accountId: d.text().notNull(),
  providerId: d.text().notNull(),
  userId: d
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
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

export const verification = createTable("verification", (d) => ({
  id: d.text().primaryKey(),
  identifier: d.text().notNull(),
  value: d.text().notNull(),
  expiresAt: d.timestamp().notNull(),
  createdAt: d.timestamp().defaultNow(),
  updatedAt: d.timestamp().defaultNow(),
}));

/* -------------------- TABLES -------------------- */

export const userMeta = createTable("user_meta", (d) => ({
  userId: d
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .primaryKey(),
  phone_number: d.text(),
  address: d.text(),
  // Add other metadata fields as needed

  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}));

export const course = createTable("course", (d) => ({
  id: d.serial().primaryKey(),
  title: d.text().notNull(),
  description: d.text(),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}));

export const courseMeta = createTable("course_meta", (d) => ({
  courseId: d
    .integer()
    .notNull()
    .references(() => course.id, { onDelete: "cascade" })
    .primaryKey(),
  category: d.text(),
  thumbnail: d.text(),
  difficulty: d.text(),
  duration: d.text(),
  data: d.jsonb(),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}));

export const topic = createTable("topic", (d) => ({
  id: d.serial().primaryKey(),
  courseId: d
    .integer()
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),
  name: d.text().notNull(),
  description: d.text(),
  order: d.integer().notNull(),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}));

export const courseModule = createTable("module", (d) => ({
  id: d.serial().primaryKey(),
  topicId: d
    .integer()
    .notNull()
    .references(() => topic.id, { onDelete: "cascade" }),
  title: d.text().notNull(),
  description: d.text(),
  order: d.integer().notNull(),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}));

export const content = createTable("content", (d) => ({
  id: d.serial().primaryKey(),
  moduleId: d
    .integer()
    .notNull()
    .references(() => courseModule.id, { onDelete: "cascade" }),
  order: d.integer().notNull(),
  title: d.text().notNull(),
  body: d.text(),
  type: contentTypeEnum("content_type").notNull(), // e.g., "video", "article"
  contentUrl: d.text(), // URL for video or other content
  contentMeta: d.jsonb(), // Additional metadata (e.g., video duration)
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}));

export const comments = createTable(
  "comments",
  (d) => ({
    id: d.serial().primaryKey(),
    contentId: d
      .integer()
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    parentCommentId: d.integer(),
    userId: d
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    commentText: d.text().notNull(),
    createdAt: d.timestamp().defaultNow().notNull(),
    updatedAt: d.timestamp().defaultNow().notNull(),
  }),
  (t) => ({
    parentReference: index("parent_comment_idx").on(t.parentCommentId),
    contentIdIdx: index("comments_content_id_idx").on(t.contentId),
    userIdIdx: index("comments_user_id_idx").on(t.userId),
  }),
);

export const question = createTable("question", (d) => ({
  id: d.serial().primaryKey(),
  type: d.text().notNull(), // e.g., "multiple-choice", "true-false"
  questionText: d.text().notNull(),
  options: d.jsonb(), // For multiple-choice questions
  correctAnswer: d.jsonb().notNull(), // Can store correct answer(s) in a flexible format
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}));

export const quiz = createTable(
  "quiz",
  (d) => ({
    id: d.serial().primaryKey(),
    contentId: d
      .integer()
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    questionId: d
      .integer()
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    createdAt: d.timestamp().defaultNow().notNull(),
    updatedAt: d.timestamp().defaultNow().notNull(),
  }),
  (t) => ({
    contentIdIdx: index("quiz_content_id_idx").on(t.contentId),
  }),
);

export const endQuiz = createTable(
  "end_quiz",
  (d) => ({
    id: d.serial().primaryKey(),
    contentId: d
      .integer()
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    quizId: d
      .integer()
      .notNull()
      .references(() => quiz.id, { onDelete: "cascade" }),
    createdAt: d.timestamp().defaultNow().notNull(),
    updatedAt: d.timestamp().defaultNow().notNull(),
  }),
  (t) => ({
    contentIdIdx: index("end_quiz_content_id_idx").on(t.contentId),
  }),
);

export const moduleQuiz = createTable("module_quiz", (d) => ({
  id: d.serial().primaryKey(),
  moduleId: d
    .integer()
    .notNull()
    .references(() => courseModule.id, { onDelete: "cascade" }),
  quizId: d
    .integer()
    .notNull()
    .references(() => quiz.id, { onDelete: "cascade" }),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}));

export const timestampedQuiz = createTable(
  "timestamped_quiz",
  (d) => ({
    id: d.serial().primaryKey(),
    contentId: d
      .integer()
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    timeStamp: d.integer().notNull(), //in seconds
    quizId: d
      .integer()
      .notNull()
      .references(() => quiz.id, { onDelete: "cascade" }),
    createdAt: d.timestamp().defaultNow().notNull(),
    updatedAt: d.timestamp().defaultNow().notNull(),
  }),
  (t) => ({
    contentIdIdx: index("timestamped_quiz_content_id_idx").on(t.contentId),
  }),
);

export const quizAttempts = createTable(
  "quiz_attempts",
  (d) => ({
    id: d.serial().primaryKey(),
    userId: d
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    quizId: d
      .integer()
      .notNull()
      .references(() => quiz.id, { onDelete: "cascade" }),
    score: d.integer().notNull(),
    attemptedAt: d.timestamp().defaultNow().notNull(),
  }),
  (t) => ({
    userIdIdx: index("quiz_attempts_user_id_idx").on(t.userId),
    // quizIdIdx: index('quiz_attempts_quiz_id_idx').on(t.quizId)
  }),
);

export const enrollments = createTable(
  "enrollments",
  (d) => ({
    userId: d
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    enrolledBy: d
      .text()
      .notNull()
      .references(() => user.id),
    courseId: d
      .integer()
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    deadline: d.integer().default(0), //in days // 0 means no deadline
    enrolledAt: d.timestamp().defaultNow().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.courseId] }),
  }),
);

export const progress = createTable(
  "progress",
  (d) => ({
    userId: d
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    contentId: d
      .integer()
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    completedAt: d.timestamp().defaultNow().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.contentId] }),
    index: index("progress_user_time_idx").on(t.userId, t.completedAt),
  }),
);

export const feedback = createTable("feedback", (d) => ({
  id: d.serial().primaryKey(),
  userId: d
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  courseId: d
    .integer()
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),
  rating: d.integer(),
  comments: d.text(),
  createdAt: d.timestamp().defaultNow().notNull(),
}));

export const speedLogs = createTable(
  "speed_logs",
  (d) => ({
    id: d.serial().primaryKey(),
    userId: d
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    contentId: d
      .integer()
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    event: videoEvents("event").notNull(),
    speed: d.numeric(4, 2),
    loggedAt: d.timestamp().defaultNow().notNull(),
  }),
  (t) => ({
    userIdIdx: index("speed_logs_user_id_idx").on(t.userId),
    contentIdIdx: index("speed_logs_content_id_idx").on(t.contentId),
  }),
);

// gamification tables

export const streak = createTable(
  "streak",
  (d) => ({
    userId: d
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    count: d.integer().notNull(),
    date: d.date().notNull(),
    createdAt: d.timestamp().defaultNow().notNull(),
    updatedAt: d.timestamp().defaultNow().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.date] }),
  }),
);

export const xp = createTable("xp", (d) => ({
  userId: d
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .primaryKey(),
  xp: d.integer().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}));

export const xpLog = createTable("xp_log", (d) => ({
  id: d.serial().primaryKey(),
  userId: d
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  xpChange: d.integer().notNull(),
  reason: d.text().notNull(),
  createdAt: d.timestamp().defaultNow().notNull(),
}));

export const badge = createTable("badge", (d) => ({
  id: d.serial().primaryKey(),
  image: d.text(),
  title: d.text().unique(),
  description: d.text(),
  conditions: d.jsonb(),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().defaultNow().notNull(),
}));

export const badgeAssignment = createTable(
  "badge_assignment",
  (d) => ({
    userId: d
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    badgeId: d
      .integer()
      .notNull()
      .references(() => badge.id, { onDelete: "cascade" }),
    assignedAt: d.timestamp().defaultNow().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.badgeId] }),
  }),
);

export const notifications = createTable(
  "notifications",
  (d) => ({
    id: d.serial().primaryKey(),
    userId: d
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    subject: d.text().notNull(),
    description: d.text(),
    status: notificationsStatus("status").notNull().default("active"),
    createdAt: d.timestamp().defaultNow().notNull(),
    updatedAt: d.timestamp().defaultNow().notNull(),
  }),
  (t) => ({
    userIdIdx: index("notifications_user_id_idx").on(t.userId),
  }),
);
