import { google } from "googleapis";

const SENDER = process.env.GMAIL_SENDER || "";
const FROM_DISPLAY = `ALX ProConnect <${SENDER}>`;

function getGmailClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !rawKey || !SENDER) return null;

  // Vercel's env var UI sometimes stores literal "\n" instead of real
  // newlines depending on how the key was pasted — normalize either way.
  const privateKey = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/gmail.send"],
    // Domain-wide delegation: this service account impersonates SENDER
    // (alxventures@...) rather than having its own mailbox. The Workspace
    // admin must have authorized this service account's Client ID for the
    // gmail.send scope in Admin Console → Security → API Controls →
    // Domain-wide Delegation. See README for the exact steps.
    subject: SENDER,
  });

  return google.gmail({ version: "v1", auth });
}

function encodeBase64Url(input: string) {
  return Buffer.from(input, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Builds a minimal RFC 2822 MIME message. Subject is UTF-8 encoded per
// RFC 2047 since recruiter/talent names may include non-ASCII characters.
function buildRawMessage({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, "utf-8").toString("base64")}?=`;
  const message = [
    `From: ${FROM_DISPLAY}`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    html,
  ].join("\r\n");

  return encodeBase64Url(message);
}

async function send({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const gmail = getGmailClient();
  if (!gmail) {
    // Not configured yet (e.g. local dev without the service account env
    // vars set up) — log instead of failing the request that triggered this.
    console.log(`[email skipped — Gmail API not configured] to=${to} subject="${subject}"`);
    return { skipped: true };
  }

  try {
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: buildRawMessage({ to, subject, html }) },
    });
    return { skipped: false };
  } catch (err) {
    console.error("Gmail API send failed:", err);
    return { skipped: false, error: err };
  }
}

function wrapper(bodyHtml: string) {
  return `
  <div style="font-family: Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1c2026;">
    <p style="font-family: Georgia, serif; font-size: 20px; margin-bottom: 24px;">
      ALX <span style="color: #c89b3c;">ProConnect</span>
    </p>
    ${bodyHtml}
    <p style="margin-top: 32px; font-size: 12px; color: #8b92a3; border-top: 1px solid #e5e3d8; padding-top: 16px;">
      ALX ProConnect · This is an automated notification.
    </p>
  </div>`;
}

export async function sendTalentSelectedEmail({
  talentEmail,
  talentName,
  recruiterName,
  recruiterCompany,
  recruiterRole,
  hiringFocus,
}: {
  talentEmail: string;
  talentName: string;
  recruiterName: string;
  recruiterCompany: string;
  recruiterRole?: string | null;
  hiringFocus?: string | null;
}) {
  const roleLine = recruiterRole ? `${recruiterRole} at ${recruiterCompany}` : recruiterCompany;
  return send({
    to: talentEmail,
    subject: `${recruiterName} viewed your ALX ProConnect profile`,
    html: wrapper(`
      <p>Hi ${talentName},</p>
      <p>
        <strong>${recruiterName}</strong> (${roleLine}) just viewed your
        ProConnect profile and would like to connect.
        ${hiringFocus ? `They're currently hiring for: ${hiringFocus}.` : ""}
      </p>
      <p>
        They now have your contact details from your profile and may reach
        out directly — no action needed from you.
      </p>
      <p style="font-size: 13px; color: #5b6270;">
        Didn't expect this, or want your profile taken down?
        <a href="${process.env.APP_URL || ""}/remove-me" style="color: #c89b3c;">Request removal</a>.
      </p>
    `),
  });
}

export async function sendProfileToRecruiterEmail({
  recruiterEmail,
  recruiterName,
  talent,
}: {
  recruiterEmail: string;
  recruiterName: string;
  talent: {
    full_name: string;
    email: string;
    phone: string | null;
    one_liner: string;
    portfolio_url: string | null;
    linkedin_url: string | null;
  };
}) {
  return send({
    to: recruiterEmail,
    subject: `${talent.full_name}'s profile — ALX ProConnect`,
    html: wrapper(`
      <p>Hi ${recruiterName},</p>
      <p>Here's the profile you selected:</p>
      <div style="background: #f3f2ec; border-radius: 8px; padding: 20px; margin: 16px 0;">
        <p style="font-size: 17px; margin: 0 0 4px;"><strong>${talent.full_name}</strong></p>
        <p style="margin: 0 0 12px; color: #5b6270;">${talent.one_liner}</p>
        <p style="margin: 0; font-size: 13px;">Email: ${talent.email}</p>
        ${talent.phone ? `<p style="margin: 0; font-size: 13px;">Phone: ${talent.phone}</p>` : ""}
        ${talent.portfolio_url ? `<p style="margin: 8px 0 0; font-size: 13px;"><a href="${talent.portfolio_url}" style="color: #c89b3c;">Portfolio ↗</a></p>` : ""}
        ${talent.linkedin_url ? `<p style="margin: 4px 0 0; font-size: 13px;"><a href="${talent.linkedin_url}" style="color: #c89b3c;">LinkedIn ↗</a></p>` : ""}
      </div>
      <p style="font-size: 13px; color: #5b6270;">
        Please use this contact information for recruitment purposes only.
      </p>
    `),
  });
}
