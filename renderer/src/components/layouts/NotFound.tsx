import { Box, Button, Typography } from "@mui/material";
import { nanoid } from "nanoid";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import MatInput from "../common/mui/MatInput";

const initValue = { value: "1", id: "1" };

export default function NotFound() {
  const navigate = useNavigate();

  const handleBack = () => navigate("/");
  const [s, setS] = useState([initValue]);

  const setValue = (e: ChangeEvent<HTMLInputElement>, data: typeof initValue) => {
    const newS = JSON.parse(JSON.stringify(s));
    newS.find((v) => v.id === data.id).value = e.target.value;
    setS(newS);
  };

  const addItem = () => {
    const newS = JSON.parse(JSON.stringify(s));
    newS.push({ value: "", id: nanoid() });
    setS(newS);
  };

  return (
    <Box>
      <Typography variant="h3" textAlign={"center"}>
        404 Not Found
        <Box>
          {s.map((v) => (
            <MatInput key={v.id} value={v.value} onChange={(e) => setValue(e, v)}></MatInput>
          ))}
        </Box>
      </Typography>
      <Button onClick={addItem}>Add</Button>
      <Button onClick={handleBack}>Back</Button>
    </Box>
  );
}
