// Canonical skill list shown as a multi-select dropdown on the talent
// intake form. Edit this one array to add/remove/rename options — every
// place that shows skills (the apply form, the admin queue, the
// directory, the PDF export) reads from what talents picked here, so
// there's nothing else to update when this list changes.
export const SKILL_OPTIONS = [
  // Software & tech
  "React",
  "JavaScript",
  "TypeScript",
  "Python",
  "Node.js",
  "HTML/CSS",
  "SQL",
  "Git/GitHub",
  "API Development",

  // Data
  "Data Analysis",
  "Data Visualization",
  "Excel/Spreadsheets",
  "Statistical Analysis",
  "Analytics",

  // Design
  "UI/UX Design",
  "Graphic Design",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Figma",
  "Branding",
  "Typography",

  // Content & marketing
  "Content Writing",
  "Copywriting",
  "Social Media Management",
  "SEO",
  "Digital Marketing",
  "Video Editing",

  // Virtual assistance & admin
  "Virtual Assistance",
  "Calendar Management",
  "Email Management",
  "Customer Support",
  "Data Entry",
  "Administrative Support",

  // Business & entrepreneurship
  "Business Strategy",
  "Financial Planning",
  "Negotiation",
  "Leadership",
  "Market Research",
  "Product Management",
  "Project Management",

  // General / soft skills
  "Problem Solving",
  "Communication",
] as const;
