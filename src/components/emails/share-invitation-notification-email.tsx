import { Button, Section, Text } from "@react-email/components";
import * as React from "react";

import { EmailLayout } from "./email-layout";
import {
  btnContainer,
  buttonColors,
  createButtonStyle,
  paragraph,
} from "./email-styles";

interface ShareInvitationNotificationEmailProps {
  recipientName: string;
  ownerName: string;
  sharingLink: string;
}

const button = createButtonStyle(buttonColors.default);

export const ShareInvitationNotificationEmail = ({
  recipientName,
  ownerName,
  sharingLink,
}: ShareInvitationNotificationEmailProps) => (
  <EmailLayout
    preview={`${ownerName} muốn chia sẻ sự kiện âm lịch với bạn`}
    footerText="Nếu bạn không muốn nhận email như này, bạn có thể từ chối lời mời."
  >
    <Text style={paragraph}>Xin chào {recipientName},</Text>
    <Text style={paragraph}>
      <strong>{ownerName}</strong> muốn chia sẻ các sự kiện âm lịch của họ với
      bạn.
    </Text>
    <Text style={paragraph}>
      Khi bạn chấp nhận lời mời này, bạn sẽ có thể xem tất cả các sự kiện âm
      lịch của họ.
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
      Thành
    </Text>
  </EmailLayout>
);
