import { Box, Chip } from "@mui/material";

interface MeasurementTypeSelectorProps {
  availableTypes: string[];
  selectedTypes: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}

const MeasurementTypeSelector = ({
  availableTypes,
  selectedTypes,
  onChange,
  disabled,
}: MeasurementTypeSelectorProps) => {
  const handleToggle = (type: string) => {
    if (disabled) return;
    const newSelectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    onChange(newSelectedTypes);
  };

  if (availableTypes.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
      }}
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {availableTypes.map((type) => (
          <Chip
            key={type}
            label={type}
            onClick={() => handleToggle(type)}
            variant={selectedTypes.includes(type) ? "filled" : "outlined"}
            color={selectedTypes.includes(type) ? "primary" : "default"}
            disabled={disabled}
            clickable
          />
        ))}
      </Box>
    </Box>
  );
};

export default MeasurementTypeSelector;
