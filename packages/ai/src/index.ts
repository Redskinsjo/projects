export type InterviewContext = {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  candidateName: string;
  messages: Array<{
    role: "SYSTEM" | "ASSISTANT" | "USER";
    content: string;
  }>;
};

export type ReportInput = InterviewContext & {
  transcript: string;
};

export type GeneratedReport = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  estimatedLevel: "JUNIOR" | "INTERMEDIATE" | "SENIOR" | "LEAD";
  scoreSignals: {
    technicalSkills: number;
    experience: number;
    communication: number;
    consistency: number;
    motivation: number;
  };
};

const fallbackQuestions = [
  "Pouvez-vous resumer votre experience la plus pertinente pour ce poste ?",
  "Quelles competences techniques maitrisez-vous le mieux parmi celles attendues ?",
  "Decrivez une situation difficile rencontree dans un projet recent et votre facon de la resoudre.",
  "Qu'est-ce qui vous motive dans cette opportunite ?",
  "Quels points aimeriez-vous clarifier avec le recruteur ?",
];

export async function generateInterviewQuestion(context: InterviewContext) {
  const askedCount = context.messages.filter(
    (message) => message.role === "ASSISTANT",
  ).length;

  return (
    fallbackQuestions[askedCount] ??
    "Merci pour vos reponses. Souhaitez-vous ajouter un dernier element important pour le recruteur ?"
  );
}

export async function generateReport(input: ReportInput): Promise<GeneratedReport> {
  const userMessages = input.messages.filter((message) => message.role === "USER");
  const joinedAnswers = userMessages.map((message) => message.content).join("\n");
  const hasDetailedAnswers = joinedAnswers.length > 500;
  const skillHits = input.requiredSkills.filter((skill) =>
    joinedAnswers.toLowerCase().includes(skill.toLowerCase()),
  ).length;
  const skillRatio =
    input.requiredSkills.length > 0 ? skillHits / input.requiredSkills.length : 0.5;

  return {
    summary: [
      `${input.candidateName} a realise un entretien automatise pour le poste ${input.jobTitle}.`,
      "Les reponses permettent une premiere lecture de l'adequation au poste, a confirmer en entretien recruteur.",
      hasDetailedAnswers
        ? "Le candidat fournit des reponses relativement detaillees."
        : "Les reponses restent synthetiques et meritent un approfondissement.",
    ].join("\n"),
    strengths: [
      skillRatio >= 0.5
        ? "Plusieurs competences attendues sont mentionnees."
        : "Le profil presente des elements exploitables pour une qualification initiale.",
      "Le candidat a complete le parcours d'entretien.",
    ],
    weaknesses: [
      skillRatio < 0.5
        ? "Peu de competences requises sont explicitement couvertes."
        : "Certains exemples gagneraient a etre quantifies.",
      "Une validation humaine reste necessaire avant decision finale.",
    ],
    estimatedLevel: hasDetailedAnswers ? "SENIOR" : "INTERMEDIATE",
    scoreSignals: {
      technicalSkills: Math.round(45 + skillRatio * 45),
      experience: hasDetailedAnswers ? 75 : 55,
      communication: joinedAnswers.length > 250 ? 75 : 55,
      consistency: 70,
      motivation: joinedAnswers.toLowerCase().includes("motivation") ? 80 : 60,
    },
  };
}
