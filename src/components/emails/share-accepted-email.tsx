import { Button, Section, Text } from "@react-email/components";
import * as React from "react";

import { EmailLayout } from "./email-layout";
import {
  btnContainer,
  buttonColors,
  createButtonStyle,
  paragraph,
} from "./email-styles";

interface ShareAcceptedEmailProps {
  ownerName: string;
  recipientName: string;
  sharingLink: string;
}

const button = createButtonStyle(buttonColors.default);

export const ShareAcceptedEmail = ({
  ownerName,
  recipientName,
  sharingLink,
}: ShareAcceptedEmailProps) => (
  <EmailLayout
    preview={`${recipientName} đã chấp nhận xem sự kiện của bạn`}
    footerText="Bạn nhận được email này vì có người đã phản hồi lời mời chia sẻ của bạn."
  >
    <Text style={paragraph}>Xin chào {ownerName},</Text>
    <Text style={paragraph}>
      Tin vui! <strong>{recipientName}</strong> đã chấp nhận lời mời chia sẻ sự
      kiện âm lịch của bạn.
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
      Thành
    </Text>
  </EmailLayout>
);
