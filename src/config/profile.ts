export const profile = {
  name: "Diego Márquez",
  role: "AI Engineer",
  siteTitle: "Diego Márquez — AI Engineer",
  siteUrlPlaceholder: "YOUR_SITE_URL",
  description:
    "AI Engineer focused on reliable agentic systems, RAG, tool use, evaluation, and production AI infrastructure.",
  githubUrl: "https://github.com/oddyEC",
  linkedInUrl: "https://www.linkedin.com/in/diego-marquezec/",
  email: "diegomarquez2008@outlook.com",
  availability: "Open to remote AI Engineering opportunities with US-aligned teams.",
  portrait: {
    src: "/media/diego-marquez.jpg",
    alt: "Diego Marquez in a gray blazer.",
  },
  resume: {
    enabled: false,
    path: "/resume.pdf",
    label: "Download résumé",
    disabledLabel: "Résumé pending",
  },
  technologies:
    "Python · Django · PostgreSQL · Redis · Celery · LangGraph · MCP · RAG · Evaluation · Observability · GCP · Docker · CI/CD",
};

export function isConfiguredUrl(value: string | null | undefined): value is string {
  return Boolean(value && /^https?:\/\//.test(value) && !value.includes("YOUR_"));
}

export function isConfiguredEmail(value: string | null | undefined): value is string {
  return Boolean(value && value.includes("@") && !value.includes("YOUR_"));
}
