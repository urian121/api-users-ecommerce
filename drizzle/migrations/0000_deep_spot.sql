CREATE TABLE "app_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_user" integer NOT NULL,
	"id_app" integer NOT NULL,
	"role" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apps" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "create_user_attempt" (
	"id" serial PRIMARY KEY NOT NULL,
	"ip" varchar(50) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_verification" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"valid_until" timestamp NOT NULL,
	"verified" boolean DEFAULT false,
	"codes_sent_count" integer DEFAULT 0,
	"last_code_sent" timestamp
);
--> statement-breakpoint
CREATE TABLE "email_verification_update" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(10) NOT NULL,
	"valid_until" timestamp NOT NULL,
	"verified" boolean DEFAULT false,
	"codes_sent_count" integer DEFAULT 0,
	"last_code_sent" timestamp
);
--> statement-breakpoint
CREATE TABLE "phone_verification" (
	"ip_id" integer PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"valid_until" timestamp NOT NULL,
	"verified" boolean DEFAULT false,
	"codes_sent_count" integer DEFAULT 0,
	"last_code_sent" timestamp
);
--> statement-breakpoint
CREATE TABLE "phone_verification_update" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"code" varchar(10) NOT NULL,
	"valid_until" timestamp NOT NULL,
	"verified" boolean DEFAULT false,
	"codes_sent_count" integer DEFAULT 0,
	"last_code_sent" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"password" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"last_name" varchar(100),
	"email" varchar(255),
	"id_number" varchar(50),
	"id_type" varchar(50),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "app_roles" ADD CONSTRAINT "app_roles_id_user_users_id_fk" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_roles" ADD CONSTRAINT "app_roles_id_app_apps_id_fk" FOREIGN KEY ("id_app") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verification" ADD CONSTRAINT "email_verification_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verification_update" ADD CONSTRAINT "email_verification_update_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phone_verification" ADD CONSTRAINT "phone_verification_ip_id_create_user_attempt_id_fk" FOREIGN KEY ("ip_id") REFERENCES "public"."create_user_attempt"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phone_verification_update" ADD CONSTRAINT "phone_verification_update_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;