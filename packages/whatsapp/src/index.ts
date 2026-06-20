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

type WhatsAppTemplateComponent = {
  type: "body";
  parameters: Array<{ type: "text"; text: string }>;
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

function getPhoneNumberId() {
  return process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_ID;
}

function normalizePhoneNumber(phoneNumber?: string | null) {
  const normalized = phoneNumber?.replace(/[^\d]/g, "");

  if (!normalized) {
    throw new Error("Numero WhatsApp manquant.");
  }

  return normalized;
}

function buildTextPayload(input: WhatsAppInvitationInput, message: string) {
  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalizePhoneNumber(input.phoneNumber),
    type: "text",
    text: {
      preview_url: true,
      body: message,
    },
  };
}

function buildTemplatePayload(input: WhatsAppInvitationInput) {
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;

  if (!templateName) return null;

  const components: WhatsAppTemplateComponent[] = [
    {
      type: "body",
      parameters: [
        { type: "text", text: input.candidateName || "candidat" },
        { type: "text", text: input.interviewUrl },
      ],
    },
  ];

  return {
    messaging_product: "whatsapp",
    to: normalizePhoneNumber(input.phoneNumber),
    type: "template",
    template: {
      name: templateName,
      language: {
        code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "fr",
      },
      components,
    },
  };
}

async function sendCloudApiMessage(payload: unknown) {
  const phoneNumberId = getPhoneNumberId();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!accessToken || !phoneNumberId) {
    return null;
  }

  const version = process.env.WHATSAPP_API_VERSION || "v23.0";
  const response = await fetch(
    `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const body = (await response.json().catch(() => null)) as {
    error?: { message?: string; code?: number; error_subcode?: number };
  } | null;

  if (!response.ok) {
    const errorMessage =
      body?.error?.message ??
      `Erreur WhatsApp Cloud API (${response.status}).`;
    const code = body?.error?.code ? ` code ${body.error.code}` : "";
    const subcode = body?.error?.error_subcode
      ? ` sous-code ${body.error.error_subcode}`
      : "";

    throw new Error(`${errorMessage}${code}${subcode}`);
  }

  return body;
}

export async function sendInterviewInvitation(
  input: WhatsAppInvitationInput,
): Promise<WhatsAppSendResult> {
  const message = buildInterviewInvitationMessage(input);

  if (!process.env.WHATSAPP_ACCESS_TOKEN || !getPhoneNumberId()) {
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

  const payload = buildTemplatePayload(input) ?? buildTextPayload(input, message);
  await sendCloudApiMessage(payload);

  return {
    sent: true,
    channel: "whatsapp",
    message,
  };
}
