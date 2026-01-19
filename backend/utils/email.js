import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(to, token) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Crée le lien final ici
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Mon App" <${process.env.SMTP_USER}>`,
    to,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <p>Bonjour,</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
      <p>Cliquez sur ce lien pour le réinitialiser :</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Si vous n'avez pas demandé ce changement, ignorez ce message.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

