import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

import { container, footer, hr, main } from "./email-styles";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  footerText: string;
}

export const EmailLayout = ({
  preview,
  children,
  footerText,
}: EmailLayoutProps) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section>{children}</Section>
        <hr style={hr} />
        <Text style={footer}>{footerText}</Text>
      </Container>
    </Body>
  </Html>
);
