import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const brandColor = "#2563EB"
const accentColor = "#F97316"

function baseTemplate(title: string, body: string, cta?: { text: string; url: string }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background: ${brandColor}; padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
    .header span { color: ${accentColor}; }
    .content { padding: 32px 24px; color: #1f2937; font-size: 16px; line-height: 1.6; }
    .code { background: #f3f4f6; border: 2px dashed ${brandColor}; border-radius: 8px; padding: 16px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: ${brandColor}; margin: 24px 0; }
    .cta { display: inline-block; background: ${accentColor}; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; margin: 16px 0; }
    .footer { background: #f9fafb; padding: 24px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Skoolyn <span>L.E.A.R.N</span></h1>
    </div>
    <div class="content">
      ${body}
      ${cta ? `<div style="text-align:center;margin-top:24px;"><a href="${cta.url}" class="cta">${cta.text}</a></div>` : ""}
    </div>
    <div class="footer">
      <p>Skoolyn L.E.A.R.N &copy; ${new Date().getFullYear()}</p>
      <p>Transforming education, one learner at a time.</p>
    </div>
  </div>
</body>
</html>
  `
}

export async function sendConfirmationEmail(to: string, name: string, code: string) {
  const html = baseTemplate(
    "Verify Your Skoolyn Account",
    `
      <p>Hello ${name},</p>
      <p>Welcome to Skoolyn L.E.A.R.N! To complete your registration, please use the verification code below:</p>
      <div class="code">${code}</div>
      <p>This code will expire in 30 minutes. If you didn't create an account, you can safely ignore this email.</p>
    `
  )

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Verify Your Skoolyn Account",
    html,
  })
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const html = baseTemplate(
    "Reset Your Password",
    `
      <p>Hello ${name},</p>
      <p>We received a request to reset your Skoolyn password. Click the button below to set a new password:</p>
    `,
    { text: "Reset Password", url: resetUrl }
  )

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Password Reset Request",
    html,
  })
}

export async function sendPaymentSuccessEmail(to: string, name: string, courseTitle: string, amount: number) {
  const html = baseTemplate(
    "Payment Successful - Skoolyn",
    `
      <p>Hello ${name},</p>
      <p>Your payment of <strong>₦${amount.toLocaleString()}</strong> for <strong>${courseTitle}</strong> was successful!</p>
      <p>You can now access your course materials and start learning right away.</p>
    `,
    { text: "Go to Dashboard", url: `${process.env.NEXT_PUBLIC_APP_URL}/student/courses` }
  )

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Enrollment Confirmed: ${courseTitle}`,
    html,
  })
}

export async function sendTeacherApprovalEmail(to: string, name: string) {
  const html = baseTemplate(
    "Teacher Application Approved",
    `
      <p>Hello ${name},</p>
      <p>Congratulations! Your teacher application on Skoolyn L.E.A.R.N has been <strong style="color:#16a34a;">APPROVED</strong>.</p>
      <p>You can now create courses, upload lessons, schedule live classes, and start sharing your knowledge with students around the world.</p>
    `,
    { text: "Teacher Dashboard", url: `${process.env.NEXT_PUBLIC_APP_URL}/teacher/courses` }
  )

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Teacher Application Approved - Skoolyn",
    html,
  })
}

export async function sendTeacherRejectionEmail(to: string, name: string, reason: string) {
  const html = baseTemplate(
    "Teacher Application Update",
    `
      <p>Hello ${name},</p>
      <p>We reviewed your teacher application and unfortunately, we are unable to approve it at this time.</p>
      <p><strong>Reason:</strong> ${reason || "Application did not meet our current requirements."}</p>
      <p>You are welcome to update your profile and reapply whenever you're ready.</p>
    `,
    { text: "Reapply Now", url: `${process.env.NEXT_PUBLIC_APP_URL}/teacher/apply` }
  )

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Teacher Application Update - Skoolyn",
    html,
  })
}

export async function sendAssignmentGradedEmail(to: string, name: string, assignmentTitle: string, score: number, maxScore: number) {
  const html = baseTemplate(
    "Assignment Graded",
    `
      <p>Hello ${name},</p>
      <p>Your submission for <strong>${assignmentTitle}</strong> has been graded.</p>
      <div style="text-align:center; font-size: 24px; font-weight: 700; color: ${brandColor}; margin: 24px 0;">
        Score: ${score} / ${maxScore}
      </div>
    `,
    { text: "View Feedback", url: `${process.env.NEXT_PUBLIC_APP_URL}/student/assignments` }
  )

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Graded: ${assignmentTitle}`,
    html,
  })
}

export async function sendLiveClassReminderEmail(to: string, name: string, classTitle: string, scheduledAt: Date, meetingUrl: string) {
  const timeStr = scheduledAt.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })
  const html = baseTemplate(
    "Live Class Reminder",
    `
      <p>Hello ${name},</p>
      <p>This is a reminder that your live class <strong>${classTitle}</strong> starts in 1 hour.</p>
      <p><strong>Time:</strong> ${timeStr}</p>
    `,
    { text: "Join Class", url: meetingUrl }
  )

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Reminder: ${classTitle} starts soon`,
    html,
  })
}
