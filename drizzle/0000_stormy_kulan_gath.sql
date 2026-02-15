CREATE TYPE "public"."college" AS ENUM('krce', 'krct', 'mkce');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('video', 'article', 'ppt');--> statement-breakpoint
CREATE TYPE "public"."department" AS ENUM('CSE', 'EEE', 'ECE', 'AI', 'AIDS');--> statement-breakpoint
CREATE TYPE "public"."notifications_status" AS ENUM('active', 'viewed', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."roles" AS ENUM('superAdmin', 'admin', 'manager', 'staff');--> statement-breakpoint
CREATE TYPE "public"."video_events" AS ENUM('pause', 'stop', 'start');--> statement-breakpoint
CREATE TABLE "Learning_portal_account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_badge" (
	"id" serial PRIMARY KEY NOT NULL,
	"image" text,
	"title" text,
	"description" text,
	"conditions" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Learning_portal_badge_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_badge_assignment" (
	"userId" text NOT NULL,
	"badgeId" integer NOT NULL,
	"assignedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Learning_portal_badge_assignment_userId_badgeId_pk" PRIMARY KEY("userId","badgeId")
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"contentId" integer NOT NULL,
	"parentCommentId" integer,
	"userId" text NOT NULL,
	"commentText" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" integer NOT NULL,
	"order" integer NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"content_type" "content_type" NOT NULL,
	"contentUrl" text,
	"contentMeta" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_course" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_end_quiz" (
	"id" serial PRIMARY KEY NOT NULL,
	"contentId" integer NOT NULL,
	"questionId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_enrollments" (
	"userId" text NOT NULL,
	"enrolledBy" text NOT NULL,
	"courseId" integer NOT NULL,
	"deadline" integer DEFAULT 0,
	"enrolledAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Learning_portal_enrollments_userId_courseId_pk" PRIMARY KEY("userId","courseId")
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"courseId" integer NOT NULL,
	"rating" integer,
	"comments" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_model_quiz" (
	"id" serial PRIMARY KEY NOT NULL,
	"contentId" integer NOT NULL,
	"timeStamp" integer NOT NULL,
	"questionId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"subject" text NOT NULL,
	"description" text,
	"status" "notifications_status" DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_progress" (
	"userId" text NOT NULL,
	"contentId" integer NOT NULL,
	"completedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Learning_portal_progress_userId_contentId_pk" PRIMARY KEY("userId","contentId")
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_question" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"questionText" text NOT NULL,
	"options" jsonb,
	"correctAnswer" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_quiz_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"quizId" integer NOT NULL,
	"score" integer NOT NULL,
	"attemptedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "Learning_portal_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_speed_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"contentId" integer NOT NULL,
	"event" "video_events" NOT NULL,
	"speed" numeric,
	"loggedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_streak" (
	"userId" text NOT NULL,
	"count" integer NOT NULL,
	"date" date NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Learning_portal_streak_userId_date_pk" PRIMARY KEY("userId","date")
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"college" "college" NOT NULL,
	"department" "department" NOT NULL,
	"role" "roles" NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Learning_portal_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_user_meta" (
	"userId" text PRIMARY KEY NOT NULL,
	"phone_number" text,
	"address" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_xp" (
	"userId" text PRIMARY KEY NOT NULL,
	"xp" integer NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Learning_portal_xp_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"xpChange" integer NOT NULL,
	"reason" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Learning_portal_account" ADD CONSTRAINT "Learning_portal_account_userId_Learning_portal_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Learning_portal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_badge_assignment" ADD CONSTRAINT "Learning_portal_badge_assignment_userId_Learning_portal_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Learning_portal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_badge_assignment" ADD CONSTRAINT "Learning_portal_badge_assignment_badgeId_Learning_portal_badge_id_fk" FOREIGN KEY ("badgeId") REFERENCES "public"."Learning_portal_badge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_comments" ADD CONSTRAINT "Learning_portal_comments_contentId_Learning_portal_content_id_fk" FOREIGN KEY ("contentId") REFERENCES "public"."Learning_portal_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_comments" ADD CONSTRAINT "Learning_portal_comments_userId_Learning_portal_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Learning_portal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_content" ADD CONSTRAINT "Learning_portal_content_courseId_Learning_portal_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."Learning_portal_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_end_quiz" ADD CONSTRAINT "Learning_portal_end_quiz_contentId_Learning_portal_content_id_fk" FOREIGN KEY ("contentId") REFERENCES "public"."Learning_portal_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_end_quiz" ADD CONSTRAINT "Learning_portal_end_quiz_questionId_Learning_portal_question_id_fk" FOREIGN KEY ("questionId") REFERENCES "public"."Learning_portal_question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_enrollments" ADD CONSTRAINT "Learning_portal_enrollments_userId_Learning_portal_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Learning_portal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_enrollments" ADD CONSTRAINT "Learning_portal_enrollments_enrolledBy_Learning_portal_user_id_fk" FOREIGN KEY ("enrolledBy") REFERENCES "public"."Learning_portal_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_enrollments" ADD CONSTRAINT "Learning_portal_enrollments_courseId_Learning_portal_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."Learning_portal_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_feedback" ADD CONSTRAINT "Learning_portal_feedback_userId_Learning_portal_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Learning_portal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_feedback" ADD CONSTRAINT "Learning_portal_feedback_courseId_Learning_portal_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."Learning_portal_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_model_quiz" ADD CONSTRAINT "Learning_portal_model_quiz_contentId_Learning_portal_content_id_fk" FOREIGN KEY ("contentId") REFERENCES "public"."Learning_portal_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_model_quiz" ADD CONSTRAINT "Learning_portal_model_quiz_questionId_Learning_portal_question_id_fk" FOREIGN KEY ("questionId") REFERENCES "public"."Learning_portal_question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_notifications" ADD CONSTRAINT "Learning_portal_notifications_userId_Learning_portal_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Learning_portal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_progress" ADD CONSTRAINT "Learning_portal_progress_userId_Learning_portal_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Learning_portal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_progress" ADD CONSTRAINT "Learning_portal_progress_contentId_Learning_portal_content_id_fk" FOREIGN KEY ("contentId") REFERENCES "public"."Learning_portal_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_quiz_attempts" ADD CONSTRAINT "Learning_portal_quiz_attempts_userId_Learning_portal_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Learning_portal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_quiz_attempts" ADD CONSTRAINT "Learning_portal_quiz_attempts_quizId_Learning_portal_end_quiz_id_fk" FOREIGN KEY ("quizId") REFERENCES "public"."Learning_portal_end_quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_session" ADD CONSTRAINT "Learning_portal_session_userId_Learning_portal_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Learning_portal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_speed_logs" ADD CONSTRAINT "Learning_portal_speed_logs_userId_Learning_portal_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Learning_portal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_speed_logs" ADD CONSTRAINT "Learning_portal_speed_logs_contentId_Learning_portal_content_id_fk" FOREIGN KEY ("contentId") REFERENCES "public"."Learning_portal_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_streak" ADD CONSTRAINT "Learning_portal_streak_userId_Learning_portal_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Learning_portal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_user_meta" ADD CONSTRAINT "Learning_portal_user_meta_userId_Learning_portal_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Learning_portal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_xp" ADD CONSTRAINT "Learning_portal_xp_userId_Learning_portal_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Learning_portal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Learning_portal_xp_log" ADD CONSTRAINT "Learning_portal_xp_log_userId_Learning_portal_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Learning_portal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "parent_comment_idx" ON "Learning_portal_comments" USING btree ("parentCommentId");--> statement-breakpoint
CREATE INDEX "comments_content_id_idx" ON "Learning_portal_comments" USING btree ("contentId");--> statement-breakpoint
CREATE INDEX "comments_user_id_idx" ON "Learning_portal_comments" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "course_order_idx" ON "Learning_portal_content" USING btree ("courseId","order");--> statement-breakpoint
CREATE INDEX "end_quiz_content_id_idx" ON "Learning_portal_end_quiz" USING btree ("contentId");--> statement-breakpoint
CREATE INDEX "model_quiz_content_id_idx" ON "Learning_portal_model_quiz" USING btree ("contentId");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "Learning_portal_notifications" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "progress_user_time_idx" ON "Learning_portal_progress" USING btree ("userId","completedAt");--> statement-breakpoint
CREATE INDEX "quiz_attempts_user_id_idx" ON "Learning_portal_quiz_attempts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "speed_logs_user_id_idx" ON "Learning_portal_speed_logs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "speed_logs_content_id_idx" ON "Learning_portal_speed_logs" USING btree ("contentId");--> statement-breakpoint
CREATE INDEX "user_idx" ON "Learning_portal_user" USING btree ("college","department","name","role","email","id");