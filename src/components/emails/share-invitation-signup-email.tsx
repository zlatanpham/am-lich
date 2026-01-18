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

interface ShareInvitationSignupEmailProps {
  signupLink: string;
  ownerName: string;
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

export const ShareInvitationSignupEmail = ({
  signupLink,
  ownerName,
}: ShareInvitationSignupEmailProps) => (
  <Html>
    <Head />
    <Preview>{ownerName} muốn chia sẻ sự kiện âm lịch với bạn</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section>
          <Text style={paragraph}>Xin chào,</Text>
          <Text style={paragraph}>
            <strong>{ownerName}</strong> muốn chia sẻ các sự kiện âm lịch của họ
            với bạn trên Lịch Âm.
          </Text>
          <Text style={paragraph}>
            Để xem các sự kiện được chia sẻ, vui lòng tạo tài khoản bằng cách
            nhấp vào nút bên dưới:
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={signupLink}>
              Tạo tài khoản & Xem sự kiện
            </Button>
          </Section>
          <Text style={paragraph}>
            Liên kết này sẽ hết hạn sau 7 ngày. Nếu bạn không muốn nhận các sự
            kiện này, bạn có thể bỏ qua email này.
          </Text>
          <Text style={paragraph}>
            Trân trọng,
            <br />
            Đội ngũ Lịch Âm
          </Text>
        </Section>
        <hr style={hr} />
        <Text style={footer}>
          Nếu bạn không mong đợi email này, bạn có thể bỏ qua.
        </Text>
      </Container>
    </Body>
  </Html>
);
