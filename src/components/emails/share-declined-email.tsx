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

interface ShareDeclinedEmailProps {
  ownerName: string;
  recipientName: string;
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

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#999999",
  fontSize: "12px",
};

export const ShareDeclinedEmail = ({
  ownerName,
  recipientName,
}: ShareDeclinedEmailProps) => (
  <Html>
    <Head />
    <Preview>{recipientName} đã từ chối xem sự kiện của bạn</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section>
          <Text style={paragraph}>Xin chào {ownerName},</Text>
          <Text style={paragraph}>
            <strong>{recipientName}</strong> đã từ chối lời mời chia sẻ sự kiện
            âm lịch của bạn.
          </Text>
          <Text style={paragraph}>
            Nếu bạn muốn chia sẻ sự kiện với người khác, bạn có thể gửi lời mời
            mới từ trang quản lý chia sẻ.
          </Text>
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
