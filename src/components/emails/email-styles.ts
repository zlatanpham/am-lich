export const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

export const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

export const paragraph = {
  fontSize: "14px",
  lineHeight: "26px",
};

export const btnContainer = {
  textAlign: "center" as const,
};

export const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

export const footer = {
  color: "#999999",
  fontSize: "12px",
};

export const createButtonStyle = (color: string) => ({
  backgroundColor: color,
  borderRadius: "3px",
  color: "#fff",
  fontSize: "14px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
});

export const buttonColors = {
  default: "#171717",
  purple: "#7c3aed",
};
