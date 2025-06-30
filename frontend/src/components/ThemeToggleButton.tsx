import * as React from "react";
import { useColorScheme } from "@mui/material/styles";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

export default function ThemeToggleButton({
  onClick,
  ...props
}: IconButtonProps) {
  const { mode, setMode, systemMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <IconButton size="small" {...props} aria-label="theme toggle" disabled />
    );
  }

  const resolvedMode = mode === "system" ? systemMode : mode;

  return (
    <IconButton
      size="small"
      aria-label="theme toggle"
      data-screenshot="toggle-mode"
      onClick={(event) => {
        setMode(resolvedMode === "dark" ? "light" : "dark");
        onClick?.(event);
      }}
      {...props}
    >
      {resolvedMode === "dark" ? (
        <LightModeRoundedIcon />
      ) : (
        <DarkModeRoundedIcon />
      )}
    </IconButton>
  );
}
