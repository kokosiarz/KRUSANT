import { SxProps, Theme } from "@mui/material/styles";

export const startHourStyles: Record<string, SxProps<Theme>> = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  pickerCard: {
    margin: 5,
  },
  summaryCard: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  summaryRight: {
    textAlign: "right",
  },
};
