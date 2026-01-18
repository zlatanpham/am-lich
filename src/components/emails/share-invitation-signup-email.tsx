import { Button, Section, Text } from "@react-email/components";
import * as React from "react";

import { EmailLayout } from "./email-layout";
import {
  btnContainer,
  buttonColors,
  createButtonStyle,
  paragraph,
} from "./email-styles";

interface ShareInvitationSignupEmailProps {
  signupLink: string;
  ownerName: string;
}

const button = createButtonStyle(buttonColors.default);

export const ShareInvitationSignupEmail = ({
  signupLink,
  ownerName,
}: ShareInvitationSignupEmailProps) => (
  <EmailLayout
    preview={`${ownerName} muốn chia sẻ sự kiện âm lịch với bạn`}
    footerText="Nếu bạn không mong đợi email này, bạn có thể bỏ qua."
  >
    <Text style={paragraph}>Xin chào,</Text>
    <Text style={paragraph}>
      <strong>{ownerName}</strong> muốn chia sẻ các sự kiện âm lịch của họ với
      bạn trên Lịch Âm.
    </Text>
    <Text style={paragraph}>
      Để xem các sự kiện được chia sẻ, vui lòng tạo tài khoản bằng cách nhấp vào
      nút bên dưới:
    </Text>
    <Section style={btnContainer}>
      <Button style={button} href={signupLink}>
        Tạo tài khoản & Xem sự kiện
      </Button>
    </Section>
    <Text style={paragraph}>
      Liên kết này sẽ hết hạn sau 7 ngày. Nếu bạn không muốn nhận các sự kiện
      này, bạn có thể bỏ qua email này.
    </Text>
    <Text style={paragraph}>
      Trân trọng,
      <br />
      Thành
    </Text>
  </EmailLayout>
);
