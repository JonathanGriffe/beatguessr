import React from "react";
import { Input } from "./components/ui/input";

function GuessInput(props: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  labelColor: 'green' | 'red' | 'black';
}) {


    const { value, onChange, onKeyDown } = props;
  return (
    <Input
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      style={{ borderColor: props.labelColor }}
    />
  );
}

export default GuessInput;