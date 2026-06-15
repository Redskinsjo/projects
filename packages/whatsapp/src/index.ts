export type WhatsAppInvitationInput = {
  phoneNumber?: string | null;
  candidateName: string;
  interviewUrl: string;
};

export type WhatsAppSendResult = {
  sent: boolean;
  channel: "whatsapp";
  message: string;
};

export function buildInterviewInvitationMessage(input: WhatsAppInvitationInput) {
  return [
    "Bonjour,",
    "",
    `Votre candidature${input.candidateName ? `, ${input.candidateName},` : ""} a ete recue.`,
    "Cliquez sur le lien suivant pour demarrer votre entretien :",
    input.interviewUrl,
  ].join("\n");
}

export async function sendInterviewInvitation(
  input: WhatsAppInvitationInput,
): Promise<WhatsAppSendResult> {
  const message = buildInterviewInvitationMessage(input);

  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_ID) {
    console.info("WhatsApp invitation simulated", {
      phoneNumber: input.phoneNumber,
      interviewUrl: input.interviewUrl,
    });

    return {
      sent: false,
      channel: "whatsapp",
      message,
    };
  }

  return {
    sent: true,
    channel: "whatsapp",
    message,
  };
}
