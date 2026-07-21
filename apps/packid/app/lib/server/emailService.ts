import net from "node:net";
import tls from "node:tls";
import crypto from "node:crypto";

type PasswordResetEmailInput = {
  to: string;
  resetUrl: string;
};

type ContactEmailInput = {
  firstName: string;
  lastName: string;
  companyName: string;
  companySector: string;
  email: string;
  phoneNumber: string;
  message: string;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
};

function getEmailAddress(value: string) {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] || value).trim();
}

function getSmtpConfig(): SmtpConfig | null {
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!user || !password) {
    return null;
  }

  const secure = process.env.SMTP_SECURE !== "false";

  return {
    host: process.env.SMTP_HOST || "ssl0.ovh.net",
    port: Number(process.env.SMTP_PORT || (secure ? 465 : 587)),
    secure,
    user,
    password,
    from: process.env.EMAIL_FROM || `Packid <${user}>`,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function encodeHeader(value: string) {
  if (/^[\x00-\x7F]*$/.test(value)) {
    return value;
  }

  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function normalizeMailBody(value: string) {
  return value.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
}

function buildMessage(input: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}) {
  const boundary = `packid-${cryptoRandomBoundary()}`;

  return [
    `From: ${input.from}`,
    `To: ${input.to}`,
    ...(input.replyTo ? [`Reply-To: ${input.replyTo}`] : []),
    `Subject: ${encodeHeader(input.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    normalizeMailBody(input.text),
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    normalizeMailBody(input.html),
    "",
    `--${boundary}--`,
  ].join("\r\n");
}

function cryptoRandomBoundary() {
  return crypto.randomBytes(12).toString("hex");
}

async function sendSmtpEmail(input: {
  config: SmtpConfig;
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}) {
  const socket = input.config.secure
    ? tls.connect({
        host: input.config.host,
        port: input.config.port,
        servername: input.config.host,
      })
    : net.connect({
        host: input.config.host,
        port: input.config.port,
      });

  socket.setEncoding("utf8");
  socket.setTimeout(15000);

  let buffer = "";
  let pending:
    | {
        codes: number[];
        resolve: (response: string) => void;
        reject: (error: Error) => void;
      }
    | null = null;

  const completeResponse = () => {
    if (!pending) return;

    const lines = buffer.split(/\r?\n/).filter(Boolean);
    const complete = lines.find((line) => /^\d{3} /.test(line));

    if (!complete) return;

    const response = buffer;
    const code = Number(complete.slice(0, 3));
    const current = pending;
    buffer = "";
    pending = null;

    if (!current.codes.includes(code)) {
      current.reject(new Error(`Reponse SMTP inattendue: ${response.trim()}`));
      return;
    }

    current.resolve(response);
  };

  socket.on("data", (chunk: string) => {
    buffer += chunk;
    completeResponse();
  });

  socket.on("timeout", () => {
    socket.destroy(new Error("Delai SMTP depasse."));
  });

  const write = (command: string) =>
    new Promise<void>((resolve, reject) => {
      socket.write(`${command}\r\n`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

  const expect = async (codes: number[]) => {
    const response = await new Promise<string>((resolve, reject) => {
      pending = { codes, resolve, reject };
      completeResponse();

      socket.once("error", reject);
    });

    return response;
  };

  await expect([220]);
  await write(`EHLO ${process.env.SMTP_HELO || "packid.local"}`);
  await expect([250]);
  await write("AUTH LOGIN");
  await expect([334]);
  await write(Buffer.from(input.config.user).toString("base64"));
  await expect([334]);
  await write(Buffer.from(input.config.password).toString("base64"));
  await expect([235]);
  await write(`MAIL FROM:<${getEmailAddress(input.config.from)}>`);
  await expect([250]);
  await write(`RCPT TO:<${getEmailAddress(input.to)}>`);
  await expect([250, 251]);
  await write("DATA");
  await expect([354]);
  await write(
    `${buildMessage({
      from: input.config.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
    })}\r\n.`,
  );
  await expect([250]);
  await write("QUIT");
  socket.end();
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput) {
  const subject = "Reinitialisation de votre mot de passe Packid";
  const text = [
    "Bonjour,",
    "",
    "Vous avez demande la reinitialisation de votre mot de passe Packid.",
    `Ouvrez ce lien pour choisir un nouveau mot de passe: ${input.resetUrl}`,
    "",
    "Ce lien expire dans 1 heure. Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet email.",
  ].join("\n");
  const safeResetUrl = escapeHtml(input.resetUrl);

  const html = `
    <p>Bonjour,</p>
    <p>Vous avez demande la reinitialisation de votre mot de passe Packid.</p>
    <p><a href="${safeResetUrl}">Choisir un nouveau mot de passe</a></p>
    <p>Ce lien expire dans 1 heure. Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet email.</p>
  `;
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    console.info("Password reset email simulated", {
      to: input.to,
      resetUrl: input.resetUrl,
    });

    return { sent: false, simulated: true };
  }

  console.info("Password reset email SMTP send", {
    to: input.to,
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    from: smtpConfig.from,
  });

  await sendSmtpEmail({
    config: smtpConfig,
    to: input.to,
    subject,
    text,
    html,
  });

  return { sent: true, simulated: false };
}

export async function sendContactEmail(input: ContactEmailInput) {
  const smtpConfig = getSmtpConfig();
  const to = process.env.SMTP_USER;
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const subject = `Nouveau message contact Packid - ${input.companyName}`;
  const text = [
    "Nouveau message depuis le formulaire de contact Packid.",
    "",
    `Prenom: ${input.firstName}`,
    `Nom: ${input.lastName}`,
    `Entreprise: ${input.companyName}`,
    `Secteur: ${input.companySector}`,
    `Email: ${input.email}`,
    `Telephone: ${input.phoneNumber}`,
    "",
    "Message:",
    input.message,
  ].join("\n");
  const html = `
    <p>Nouveau message depuis le formulaire de contact Packid.</p>
    <dl>
      <dt>Nom</dt>
      <dd>${escapeHtml(fullName)}</dd>
      <dt>Entreprise</dt>
      <dd>${escapeHtml(input.companyName)}</dd>
      <dt>Secteur</dt>
      <dd>${escapeHtml(input.companySector)}</dd>
      <dt>Email</dt>
      <dd>${escapeHtml(input.email)}</dd>
      <dt>Telephone</dt>
      <dd>${escapeHtml(input.phoneNumber)}</dd>
    </dl>
    <p><strong>Message</strong></p>
    <p>${escapeHtml(input.message).replaceAll("\n", "<br />")}</p>
  `;

  if (!smtpConfig || !to) {
    console.info("Contact email simulated", {
      to,
      from: input.email,
      companyName: input.companyName,
    });

    return { sent: false, simulated: true };
  }

  console.info("Contact email SMTP send", {
    to,
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    from: smtpConfig.from,
    replyTo: input.email,
  });

  await sendSmtpEmail({
    config: smtpConfig,
    to,
    subject,
    text,
    html,
    replyTo: input.email,
  });

  return { sent: true, simulated: false };
}
