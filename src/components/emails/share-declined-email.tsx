import { Text } from "@react-email/components";
import * as React from "react";

import { EmailLayout } from "./email-layout";
import { paragraph } from "./email-styles";

interface ShareDeclinedEmailProps {
  ownerName: string;
  recipientName: string;
}

export const ShareDeclinedEmail = ({
  ownerName,
  recipientName,
}: ShareDeclinedEmailProps) => (
  <EmailLayout
    preview={`${recipientName} đã từ chối xem sự kiện của bạn`}
    footerText="Bạn nhận được email này vì có người đã phản hồi lời mời chia sẻ của bạn."
  >
    <Text style={paragraph}>Xin chào {ownerName},</Text>
    <Text style={paragraph}>
      <strong>{recipientName}</strong> đã từ chối lời mời chia sẻ sự kiện âm
      lịch của bạn.
    </Text>
    <Text style={paragraph}>
      Nếu bạn muốn chia sẻ sự kiện với người khác, bạn có thể gửi lời mời mới từ
      trang quản lý chia sẻ.
    </Text>
    <Text style={paragraph}>
      Trân trọng,
      <br />
      Thành
    </Text>
  </EmailLayout>
);
