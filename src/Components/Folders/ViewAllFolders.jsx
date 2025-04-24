import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {IconSearch, IconMinus, IconFolderFilled, IconX, IconCheck} from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { updateActiveComponent } from '../../actions/componentAction';
import { Button, Input, useMantineTheme, Modal, Group, Text, useMantineColorScheme, Checkbox, TextInput } from '@mantine/core';
import classes from "../../style/SearchInput.module.css";
import {showNotification, updateNotification} from "@mantine/notifications";

export default function ViewFiles() {
    const API_URL = process.env.REACT_APP_API_URL;    
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDarkMode = colorScheme === 'dark'; // Check if dark mode is active
  const [folders, setFolders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const dispatch = useDispatch();
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [searchError, setSearchError] = useState('Atlasa datus...');
    //esmu done
  useEffect(() => {
    fetch(`${API_URL}/api/listFolders`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
          console.log(data)
        setFolders(data.folders);
          setSearchError("Nevar atrast šādu mapi.")
      })
      .catch((error) => {
          showNotification({
              id:'fetch-error',
              color:'red',
              autoClose: false,
              title: "Kļūda iegūstot mapju sarakstu",
              message:error.message,
              icon: <IconX size={18}/>
          });
      });
  }, []);

  useEffect(() => {
    dispatch(updateActiveComponent('view'));
  }, [dispatch]);

    const filteredFolders = folders.filter(folder =>
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  const handleAddFolder = async () => {
    if (newFolderName.length === 0) {
      setError("Nosaukums nevar būt tukšs");
      return;
    }

    if (newFolderName.length > 255) {
      setError('Nosaukuma maksimālais garums ir 255 rakstzīmes');
      return;
    }

    setError('');
    try {
        showNotification({
            id:'creating-folder',
            autoClose: false,
            title: "Izveido mapi...",
            loading: true
        });
        if(!hasPassword){
            setPassword("")
        }
      const response = await fetch(`${API_URL}/api/createFolder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            folder_name: newFolderName,
            password:password,
        }),
      });
        if (!response.ok) {
            const errorData = await response.json()
            updateNotification({
                id: "creating-folder",
                color: 'red',
                autoClose: true,
                title: "Mapes izveide neizdevās.",
                message: errorData.error || "Nezināma kļūda, ja tā turpinās, sazināties ar skolas IT speciālistu",
                loading: false,
                icon: <IconX size={18} />
            });
            return;
        }
        updateNotification({
            id:"creating-folder",
            color:'teal',
            autoClose: true,
            title: "Mape izveidota veiksmīgi!",
            loading: false,
            icon: <IconCheck size={18}/>
        });
      const data = await response.json();
        setFolders((prevFolders) => [
            ...prevFolders,
            { name: data.folder, has_password: hasPassword } // Ensure object structure
        ]);
      setShowAddFolderModal(false);
      setNewFolderName('');
      setPassword("")
    } catch (error) {
        console.log(error)
        showNotification({
            id:'creating-folder',
            color:'red',
            autoClose: false,
            title: "Kļūda veicot pieprasījumu uz aizmugurgalsistēmu",
            message:error.message,
            icon: <IconX size={18}/>
        });
    }
  };

    const deleteFolder = async (folder) => {
        try {
            showNotification({
                id: 'deleting-folder',
                autoClose: false,
                title: "Dzēš mapi...",
                loading: true
            });

            const response = await fetch(`${API_URL}/api/deleteFolder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ folder_name: folder }),
            });
            if (!response.ok) {
                updateNotification({
                    id: "deleting-folder",
                    color: 'red',
                    autoClose: true,
                    title: "Mapes izdzēšana neizdevās.",
                    loading: false,
                    icon: <IconX size={18}/>
                });
                throw new Error('Failed to delete folder');
            }
            
            updateNotification({
                id: "deleting-folder",
                color: 'teal',
                autoClose: true,
                title: "Mape izdzēsta veiksmīgi!",
                loading: false,
                icon: <IconCheck size={18}/>
            });
            
            setFolders((prevFolders) => prevFolders.filter((f) => f.name !== folder));
            
            setShowDeleteFolderModal(false);

        } catch (error) {
            console.error('Error deleting folder:', error);
            showNotification({
                id: 'deleting-folder',
                color: 'red',
                autoClose: false,
                title: "Kļūda veicot pieprasījumu uz aizmugurgalsistēmu",
                message: error.message,
                icon: <IconX size={18}/>
            });
        }
    };

    const handleDeleteButtonClick = (folder) => {
    setFolderToDelete(folder);
    setShowDeleteFolderModal(true);
  };

  return (
    <div className="manage-main">
      <div className="search-bar">
        <Input 
        placeholder='Mapes nosakums...'
        classNames={{ wrapper: classes.maxWidth }} 
        leftSection={<IconSearch size={18} />} 
        size='md' 
        variant="filled"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}  />
        <Button onClick={() => setShowAddFolderModal(true)} size='md'>Pievienot mapi</Button>
      </div>
      <Modal
        opened={showAddFolderModal}
        onClose={() => setShowAddFolderModal(false)}
        title="Ievadiet mapes nosaukumu:"
        centered
      >
        <TextInput
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Mapes nosaukums"
          variant="filled"
          label="Mapes nosaukums"
        />
        {error && <Text color="red">{error}</Text>}
          <TextInput
              mt={20}
              placeholder="Mapes parole"
              variant="filled"
              label="Mapes Parole"
              disabled={!hasPassword}
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
          />
          <Checkbox
              mt={20}
              label={"Mape ar paroli"}
              checked={hasPassword}
              onChange={(event) => setHasPassword(event.currentTarget.checked)}
          />
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={handleAddFolder}>Izveidot</Button>
          <Button variant="outline" onClick={() => setShowAddFolderModal(false)}>Atcelt</Button>
        </div>
      </Modal>

      {/* Delete Folder Modal */}
      <Modal
        opened={showDeleteFolderModal}
        onClose={() => setShowDeleteFolderModal(false)}
        title={`Dzēst "${folderToDelete}"?`}
        centered
      >
        <Text>Mape un viss tās saturs pazudīs mūžīgi.</Text>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <Button color="red" onClick={() => deleteFolder(folderToDelete)}>Jā, izdzēst</Button>
            <Button variant="outline" onClick={() => setShowDeleteFolderModal(false)}>Atcelt</Button>
          </div>
      </Modal>

      <div className="folder-main">
        {filteredFolders.length > 0 ? (
          filteredFolders.map((folder, index) => (
            <div key={index} className="screen-button">
              <Link to={`/dashboard/folderContent/${folder.name}`} title={folder}>
                <div className="folder-icon">
                  <IconFolderFilled size={60} color={isDarkMode ? theme.colors.blue[8] : theme.colors.blue[6]} />
                </div>
                <Text ta="center" color={isDarkMode ? "white" : "black"}>{folder.name}</Text>
              </Link>
              <button className="red" onClick={(e) => {
                e.stopPropagation();
                handleDeleteButtonClick(folder.name);
              }}>
                <IconMinus size={20} stroke={3} color='white' />
              </button>
            </div>
          ))
        ) : (
          <Text className="search-error">{searchError}</Text>
        )}
      </div>
    </div>
  );
}
