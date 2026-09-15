import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "ALX ProConnect <onboarding@resend.dev>";

function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
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
  const resend = getClient();
  if (!resend) {
    // No API key configured (e.g. local dev without .env set up) — log
    // instead of failing the request that triggered this email.
    console.log(`[email skipped — no RESEND_API_KEY] to=${to} subject="${subject}"`);
    return { skipped: true };
  }

  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error("Resend send failed:", error);
    return { skipped: false, error };
  }
  return { skipped: false };
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
