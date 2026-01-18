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

interface ShareAcceptedEmailProps {
  ownerName: string;
  recipientName: string;
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
  backgroundColor: "#22c55e",
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

export const ShareAcceptedEmail = ({
  ownerName,
  recipientName,
  sharingLink,
}: ShareAcceptedEmailProps) => (
  <Html>
    <Head />
    <Preview>{recipientName} đã chấp nhận xem sự kiện của bạn</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section>
          <Text style={paragraph}>Xin chào {ownerName},</Text>
          <Text style={paragraph}>
            Tin vui! <strong>{recipientName}</strong> đã chấp nhận lời mời chia
            sẻ sự kiện âm lịch của bạn.
          </Text>
          <Text style={paragraph}>
            Họ giờ đây có thể xem tất cả các sự kiện âm lịch bạn đã tạo.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={sharingLink}>
              Quản lý chia sẻ
            </Button>
          </Section>
          <Text style={paragraph}>
            Trân trọng,
            <br />
            Đội ngũ Lịch Âm
          </Text>
        </Section>
        <hr style={hr} />
        <Text style={footer}>
          Bạn nhận được email này vì có người đã phản hồi lời mời chia sẻ của
          bạn.
        </Text>
      </Container>
    </Body>
  </Html>
);
