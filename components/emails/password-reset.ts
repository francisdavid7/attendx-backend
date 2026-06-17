import { baseTemplate } from "./layouts/base-template.js";

export const passwordResetTemplate = (name: string, link: string) =>
  baseTemplate({
    name,
    title: "Reset Your Password",
    description:
      "We received a request to reset your password. Click the button below to continue.",
    actionText: "Reset Password",
    actionLink: link,
    notice: "🔒 This reset link expires in 30 minutes.",
  });
