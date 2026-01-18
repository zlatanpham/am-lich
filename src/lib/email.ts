import { Resend } from "resend";
import { env } from "@/env.js";
import * as React from "react";
import { ResetPasswordEmail } from "@/components/emails/reset-password-email";
import { ShareInvitationSignupEmail } from "@/components/emails/share-invitation-signup-email";
import { ShareInvitationNotificationEmail } from "@/components/emails/share-invitation-notification-email";
import { ShareAcceptedEmail } from "@/components/emails/share-accepted-email";
import { ShareDeclinedEmail } from "@/components/emails/share-declined-email";

const resend = new Resend(env.RESEND_API_KEY ?? "");

export async function sendPasswordResetEmail(
  to: string,
  token: string,
  resetLink: string,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM ?? "noreply@example.com",
      to: [to],
      subject: "Reset your password",
      react: React.createElement(ResetPasswordEmail, {
        resetLink,
      }),
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error: error.message };
    }

    console.log("Password reset email sent:", data);
    return { success: true };
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error in sendPasswordResetEmail:", error);
    return { success: false, error: errorMessage };
  }
}

export async function sendShareInvitationSignupEmail(
  to: string,
  ownerName: string,
  token: string,
) {
  try {
    const signupLink = `${env.NEXTAUTH_URL}/signup?invitation=${token}`;

    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM ?? "noreply@example.com",
      to: [to],
      subject: `${ownerName} muốn chia sẻ sự kiện âm lịch với bạn`,
      react: React.createElement(ShareInvitationSignupEmail, {
        signupLink,
        ownerName,
      }),
    });

    if (error) {
      console.error("Error sending share invitation signup email:", error);
      return { success: false, error: error.message };
    }

    console.log("Share invitation signup email sent:", data);
    return { success: true };
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error in sendShareInvitationSignupEmail:", error);
    return { success: false, error: errorMessage };
  }
}

export async function sendShareInvitationNotificationEmail(
  to: string,
  recipientName: string,
  ownerName: string,
) {
  try {
    const sharingLink = `${env.NEXTAUTH_URL}/sharing`;

    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM ?? "noreply@example.com",
      to: [to],
      subject: `${ownerName} muốn chia sẻ sự kiện âm lịch với bạn`,
      react: React.createElement(ShareInvitationNotificationEmail, {
        recipientName,
        ownerName,
        sharingLink,
      }),
    });

    if (error) {
      console.error(
        "Error sending share invitation notification email:",
        error,
      );
      return { success: false, error: error.message };
    }

    console.log("Share invitation notification email sent:", data);
    return { success: true };
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error in sendShareInvitationNotificationEmail:", error);
    return { success: false, error: errorMessage };
  }
}

export async function sendShareAcceptedEmail(
  to: string,
  ownerName: string,
  recipientName: string,
) {
  try {
    const sharingLink = `${env.NEXTAUTH_URL}/sharing`;

    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM ?? "noreply@example.com",
      to: [to],
      subject: `${recipientName} đã chấp nhận xem sự kiện của bạn`,
      react: React.createElement(ShareAcceptedEmail, {
        ownerName,
        recipientName,
        sharingLink,
      }),
    });

    if (error) {
      console.error("Error sending share accepted email:", error);
      return { success: false, error: error.message };
    }

    console.log("Share accepted email sent:", data);
    return { success: true };
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error in sendShareAcceptedEmail:", error);
    return { success: false, error: errorMessage };
  }
}

export async function sendShareDeclinedEmail(
  to: string,
  ownerName: string,
  recipientName: string,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM ?? "noreply@example.com",
      to: [to],
      subject: `${recipientName} đã từ chối xem sự kiện của bạn`,
      react: React.createElement(ShareDeclinedEmail, {
        ownerName,
        recipientName,
      }),
    });

    if (error) {
      console.error("Error sending share declined email:", error);
      return { success: false, error: error.message };
    }

    console.log("Share declined email sent:", data);
    return { success: true };
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error in sendShareDeclinedEmail:", error);
    return { success: false, error: errorMessage };
  }
}
