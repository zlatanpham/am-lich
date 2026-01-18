import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ShareInvitationNotificationEmailProps {
  recipientName: string;
  ownerName: string;
  sharingLink: string;
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "26px",
};

const btnContainer = {
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#7c3aed",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "14px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#999999",
  fontSize: "12px",
};

export const ShareInvitationNotificationEmail = ({
  recipientName,
  ownerName,
  sharingLink,
}: ShareInvitationNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>{ownerName} muốn chia sẻ sự kiện âm lịch với bạn</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section>
          <Text style={paragraph}>Xin chào {recipientName},</Text>
          <Text style={paragraph}>
            <strong>{ownerName}</strong> muốn chia sẻ các sự kiện âm lịch của họ
            với bạn.
          </Text>
          <Text style={paragraph}>
            Khi bạn chấp nhận lời mời này, bạn sẽ có thể xem tất cả các sự kiện
            âm lịch của họ.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={sharingLink}>
              Xem lời mời
            </Button>
          </Section>
          <Text style={paragraph}>
            Bạn có thể chấp nhận hoặc từ chối lời mời này bất cứ lúc nào.
          </Text>
          <Text style={paragraph}>
            Trân trọng,
            <br />
            Đội ngũ Lịch Âm
          </Text>
        </Section>
        <hr style={hr} />
        <Text style={footer}>
          Nếu bạn không muốn nhận email như này, bạn có thể từ chối lời mời.
        </Text>
      </Container>
    </Body>
  </Html>
);
