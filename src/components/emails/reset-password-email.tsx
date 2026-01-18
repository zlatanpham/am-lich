import { Button, Section, Text } from "@react-email/components";
import * as React from "react";

import { EmailLayout } from "./email-layout";
import {
  btnContainer,
  buttonColors,
  createButtonStyle,
  paragraph,
} from "./email-styles";

interface ResetPasswordEmailProps {
  resetLink: string;
}

const button = createButtonStyle(buttonColors.default);

export const ResetPasswordEmail = ({ resetLink }: ResetPasswordEmailProps) => (
  <EmailLayout
    preview="Reset your password"
    footerText="If you were not expecting this email, you can ignore this email."
  >
    <Text style={paragraph}>Hi,</Text>
    <Text style={paragraph}>
      You recently requested to reset the password for your account. Click the
      button below to proceed.
    </Text>
    <Section style={btnContainer}>
      <Button style={button} href={resetLink}>
        Reset password
      </Button>
    </Section>
    <Text style={paragraph}>
      If you did not request a password reset, please ignore this email or reply
      to let us know. This password reset link is only valid for the next 60
      minutes.
    </Text>
    <Text style={paragraph}>
      Thanks,
      <br />
      Thanh
    </Text>
  </EmailLayout>
);
