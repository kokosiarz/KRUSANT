import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

const DurationPicker: React.FC<{ label: string; durationHHmm: string; setDuration: (value: string) => void }> = ({ label, durationHHmm, setDuration }) => {
    const options = [
        '00:15', '00:30', '00:45',
        '01:00', '01:15', '01:30', '01:45',
        '02:00', '02:15', '02:30', '02:45',
        '03:00', '03:30', 
        '04:00', '04:30', 
        '05:00', 
        // '05:30', '06:00',
        // '06:30', '07:00', '08:00',
    ];
    return (    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id={label}>{label}</InputLabel>
        <Select
          labelId={label}
          id={label}
          value={durationHHmm}
          label={label}
          onChange={(event) => setDuration(event.target.value)}
        >
            {options.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>)
}

export default DurationPicker;