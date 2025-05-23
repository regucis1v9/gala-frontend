import { TextInput, Input } from '@mantine/core';
import classes from '../../style/ContainedInput.module.css';

export default function MantineInput({ label, placeholder, value, onChange, type = "text", error }) {
  return (
    <>
    <TextInput
      variant='filled'
      label={label}            // Accept label prop
      placeholder={placeholder} // Accept placeholder prop
      value={value}             // Accept value prop
      onChange={onChange}       // Accept onChange handler
      type={type}               // Accept type prop (default is text)
      classNames={classes}      // Apply the custom styles from the CSS module
      error={error}
    />
    </>
  );
}
