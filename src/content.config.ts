import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const metricSchema = z.object({
  label: z.string(),
  value: z.string(),
  note: z.string().optional(),
});

const decisionSchema = z.object({
  title: z.string(),
  body: z.string(),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    status: z.string(),
    headline: z.string().optional(),
    description: z.array(z.string()),
    tags: z.array(z.string()),
    priority: z.number(),
    repoUrl: z.url().nullable().optional(),
    architecture: z.array(z.string()).optional(),
    metrics: z.array(metricSchema).optional(),
    decisions: z.array(decisionSchema).optional(),
    disclosure: z.string().optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    tags: z.array(z.string()),
    order: z.number(),
  }),
});

export const collections = { projects, notes };
