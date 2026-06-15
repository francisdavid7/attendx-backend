import { baseTemplate } from "./layouts/base-template";

export const welcomeTemplate = (name: string, dashboardLink: string) =>
  baseTemplate({
    name,
    title: "Welcome To AttendX",
    description:
      "Your account has been successfully created. You can now start managing attendance, reports and users from your dashboard.",
    actionText: "Go To Dashboard",
    actionLink: dashboardLink,
    notice: "🎉 Your account is now active and ready to use.",
  });
