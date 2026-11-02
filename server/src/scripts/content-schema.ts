// Shape of the course content files in server/content. Shared by the seeder
// (files -> database) and the exporter (database -> files). Everything learners
// read lives in these files, versioned in git, instead of in SQL migrations.
import { z } from "zod";

const text = (max: number) => z.string().max(max);

export const quizQuestion = z.object({
  question: text(1000).min(1),
  options: z.array(text(500).min(1)).min(2).max(5),
  correct: z.number().int().min(0),
  explanation: text(2000).default(""),
}).refine((q) => q.correct < q.options.length, { message: "correct must point at one of the options" });

export const scenarioStep = z.object({
  prompt: text(1000).min(1),
  options: z.array(text(500).min(1)).min(2),
  feedback: z.array(text(1000)).default([]),
  best: z.number().int().min(0).default(0),
});

export const lessonFile = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug: lowercase words with dashes"),
  title: text(200).min(1),
  type: z.enum(["read", "quiz", "practice", "scenario"]).default("read"),
  est_minutes: z.number().int().min(1).max(60).default(5),
  body: text(20000).default(""),
  key_points: z.array(text(300)).default([]),
  try_it: text(1000).nullish(),
  motif: text(60).nullish(),
  image_url: text(1000).nullish(),
  audio_url: text(1000).nullish(),
  video_url: text(1000).nullish(),
  published: z.boolean().default(true),
  quiz: z.array(quizQuestion).default([]),
  scenario: z.array(scenarioStep).default([]),
});

export const moduleFile = z.object({
  title: text(200).min(1),
  summary: text(1000).default(""),
  lessons: z.array(lessonFile).min(1),
});

export const courseFile = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: text(200).min(1),
  tagline: text(300).default(""),
  description: text(5000).default(""),
  pathway: z.string().nullish(),   // pathway slug
  category: z.string().nullish(),  // category slug
  icon_name: text(60).default("BookOpen"),
  difficulty: z.enum(["start_here", "easy", "intermediate"]).default("easy"),
  estimated_hours: z.number().min(0).default(1),
  pass_mark: z.number().int().min(0).max(100).default(70),
  outcomes: z.array(text(300)).default([]),
  image_url: text(1000).nullish(),
  sort_order: z.number().int().default(0),
  published: z.boolean().default(true),
  modules: z.array(moduleFile).min(1),
});

export const pathwayFile = z.object({
  slug: z.string(), title: z.string(), subtitle: z.string().default(""), description: z.string().default(""),
  icon_name: z.string().default("Compass"), accent: z.enum(["primary", "accent"]).default("primary"),
  sort_order: z.number().int().default(0), published: z.boolean().default(true),
});
export const categoryFile = z.object({
  slug: z.string(), name: z.string(), icon_name: z.string().default("Circle"), sort_order: z.number().int().default(0),
});
export const badgeFile = z.object({
  slug: z.string(), name: z.string(), description: z.string().default(""),
  criteria: z.record(z.string(), z.unknown()).default({}), icon_name: z.string().default("Award"),
});

export type CourseFile = z.infer<typeof courseFile>;
export type LessonFile = z.infer<typeof lessonFile>;
