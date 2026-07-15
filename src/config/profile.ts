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
  technologies: [
    { name: "Python", icon: "Py", category: "Language", color: "#3776ab", ink: "#ffffff" },
    { name: "Django", icon: "Dj", category: "Backend", color: "#0c4b33", ink: "#ffffff" },
    { name: "PostgreSQL", icon: "PG", category: "Database", color: "#336791", ink: "#ffffff" },
    { name: "Redis", icon: "Rd", category: "Cache", color: "#dc382d", ink: "#ffffff" },
    { name: "Celery", icon: "Ce", category: "Workers", color: "#37814a", ink: "#ffffff" },
    { name: "LangGraph", icon: "LG", category: "Agents", color: "#1f8a70", ink: "#ffffff" },
    { name: "MCP", icon: "MCP", category: "Tooling", color: "#6c5ce7", ink: "#ffffff" },
    { name: "RAG", icon: "RAG", category: "AI Systems", color: "#f59e0b", ink: "#111827" },
    { name: "Evaluation", icon: "Ev", category: "Quality", color: "#0ea5e9", ink: "#ffffff" },
    { name: "Observability", icon: "Ob", category: "Operations", color: "#14b8a6", ink: "#06201c" },
    { name: "Google Cloud", icon: "GCP", category: "Cloud", color: "#4285f4", ink: "#ffffff" },
    { name: "Docker", icon: "Do", category: "Delivery", color: "#2496ed", ink: "#ffffff" },
  ],
  certifications: [
    {
      name: "Professional Cloud Architect Certification",
      issuer: "Google Cloud",
      issuedTo: "Diego Marquez",
      verificationUrl: "https://www.credly.com/badges/bdd1070e-5688-4a0d-b27f-c7cdeff4ace2",
      imageUrl: "https://images.credly.com/images/71c579e0-51fd-4247-b493-d2fa8167157a/linkedin_thumb_image.png",
      summary:
        "Verified credential for designing, developing, and managing secure, scalable, highly available Google Cloud solutions.",
      skills: ["Cloud architecture", "Security", "Reliability", "Scalability"],
    },
  ],
};

export function isConfiguredUrl(value: string | null | undefined): value is string {
  return Boolean(value && /^https?:\/\//.test(value) && !value.includes("YOUR_"));
}

export function isConfiguredEmail(value: string | null | undefined): value is string {
  return Boolean(value && value.includes("@") && !value.includes("YOUR_"));
}
