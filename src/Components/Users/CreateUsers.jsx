import React, { useState } from "react";
import MantineInput from "../Mantine/MantineInput";
import { Button } from "@mantine/core";
import dropdown from "../../style/ContainedInput.module.css";
import { Select, LoadingOverlay } from "@mantine/core";
import {showNotification, updateNotification} from "@mantine/notifications";
import {IconCheck, IconX} from "@tabler/icons-react";

export default function CreateUsers() {
  const token = localStorage.getItem('token');
  const [createdUser, setCreatedUser] = useState(false);
  const [visible, setVisible] = useState(false);
    const API_URL = process.env.REACT_APP_API_URL;

    const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [roleError, setRoleError] = useState(""); 

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    if (value.trim() === "") {
      setUsernameError("Lietotājvārds ir obligāts");
    } else {
      setUsernameError("");
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value.trim() === "") {
      setEmailError("E-pasts ir obligāts");
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      setEmailError("Neatbilstošs e-pasta formāts");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value.trim() === "") {
      setPasswordError("Parole ir obligāta");
    } else if (value.length < 8) {
      setPasswordError("Parolei jābūt vismaz 8 rakstzīmēm");
    } else {
      setPasswordError("");
    }
  };

  const handleRoleChange = (value) => {
    setRole(value);
    if (value.trim() === "") {
      setRoleError("Lūdzu izvēlieties pieejas līmeni");
    } else {
      setRoleError("");
    }
  };

  const submitForm = async () => {
    let isValid = true;

    if (usernameError || emailError || passwordError || roleError) {
      isValid = false;
    }

    if (isValid) {
      setVisible(true); 
      try {
          showNotification({
              id: 'saving',
              autoClose: false,
              title: "Veic lietotāja izveidi...",
              loading: true
          });
        const response = await fetch(`${API_URL}/api/createUser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: username,
            password: password,
            email: email,
            role: role
          }),
        });
        const data = await response.json();
        setVisible(false);
        if (response.ok) {
            updateNotification({
                id: "saving",
                color: 'red',
                autoClose: false,
                title: "Radās kļūda izveidojot lietotāju.",
                loading: false,
                icon: <IconX size={18} />
            });
          console.log(data);
          setCreatedUser(true);
            updateNotification({
                id: "saving",
                color: 'teal',
                autoClose: true,
                title: "Lietotājs izveidots veiksmīgi!",
                loading: false,
                icon: <IconCheck size={18} />
            });
          setEmail("")
          setUsername("")
          setPassword("")
        } else {
          if (data.errors) {
            setCreatedUser(false);
            setUsernameError(data.errors.name || '');
            setEmailError(data.errors.email || '');
            setPasswordError(data.errors.password || '');
            setRoleError(data.errors.role || ''); 
          }
            updateNotification({
                id: "saving",
                color: 'red',
                autoClose: false,
                title: "Radās kļūda izveidojot lietotāju.",
                loading: false,
                icon: <IconX size={18} />
            });
          throw new Error(data.message || 'Neizdevās izveidot lietotāju');
        }
      } catch (error) {
          updateNotification({
              id: "saving",
              color: 'red',
              autoClose: false,
              title: "Radās kļūda izveidojot lietotāju.",
              loading: false,
              icon: <IconX size={18} />
          });
        console.log(`Error: ${error.message}`);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <div className="create-user-content">
      Izveidot lietotāju
      <form className="create-container" onSubmit={handleSubmit}>
      <LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <span>
          <MantineInput
            label="Lietotājvārds"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Lietotājvārds"
            error={usernameError}
          />
        </span>
        <span>
          <MantineInput
            label="Epasts"
            value={email}
            onChange={handleEmailChange}
            placeholder="Epasts"
            error={emailError}
          />
        </span>
        <span>
          <MantineInput
            label="Parole"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Parole"
            error={passwordError}
          />
        </span>
        <span>
          <Select
            variant="filled"
            label="Pieejas līmenis"
            id="folderSelect"
            data={['Rediģētājs', 'Administrators']}
            placeholder="Izvēlieties pieejas līmeni"
            value={role}
            onChange={handleRoleChange}
            classNames={dropdown}
            error={roleError}
          />
        </span>
        <span className="flex-column align-center">
          <Button size="md" type="submit">Izveidot lietotāju</Button>
        </span>
      </form>
    </div>
  );
}
