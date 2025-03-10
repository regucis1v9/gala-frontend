import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IconSearch, IconMinus, IconFolderFilled, IconLock } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { updateActiveComponent } from '../../actions/componentAction';
import { Button, Input, useMantineTheme, Modal, Group, Text, useMantineColorScheme, PasswordInput } from '@mantine/core';
import classes from "../../style/SearchInput.module.css";
export default function AllFoldersUser() {
    const API_URL = process.env.REACT_APP_API_URL;
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [folders, setFolders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const token = localStorage.getItem('token');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_URL}/api/listFolders`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setFolders(data.folders);
            })
            .catch((error) => {
                console.error("Error fetching folder list:", error);
            });
    }, []);

    useEffect(() => {
        dispatch(updateActiveComponent('view'));
    }, [dispatch]);

    const filteredFolders = folders.filter(folder =>
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFolderClick = (folder) => {
        if (folder.has_password) {
            setSelectedFolder(folder);
            setModalOpen(true);
            setErrorMessage('');
        } else {
            navigate(`/folderContent/${folder.name}`);
        }
    };

    const unlockFolder = () => {
        fetch(`${API_URL}/api/unlockFolder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ folder_name: selectedFolder.name, password }),
            credentials: "include",
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === "Folder unlocked successfully") {
                    localStorage.setItem('session_token', data.session_token);
                    
                    setModalOpen(false);
                    navigate(`/folderContent/${selectedFolder.name}`);
                } else {
                    setErrorMessage("Nepareiza parole. Mēģini vēlreiz");
                }
            })
            .catch(error => {
                console.error("Error unlocking folder:", error);
                setErrorMessage("Radās kļūme. Mēģini vēlreiz.");
            });
    };


    return (
        <div className="manage-main">
            <div className="search-bar">
                <Input
                    placeholder='Mapes nosaukums...'
                    classNames={{ wrapper: classes.maxWidth }}
                    leftSection={<IconSearch size={18} />}
                    size='md'
                    variant="filled"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.currentTarget.value)}
                />
            </div>

            <div className="folder-main">
                {filteredFolders.length > 0 ? (
                    filteredFolders.map((folder, index) => (
                        <div key={index} className="screen-button" onClick={() => handleFolderClick(folder)}>
                            <div className="folder-icon">
                                <IconFolderFilled size={60} color={isDarkMode ? theme.colors.blue[8] : theme.colors.blue[6]} />
                                {folder.has_password && <IconLock
                                    size={20}
                                    style={{
                                        position: 'absolute',
                                        color: isDarkMode ? theme.colors.blue[8] : theme.colors.blue[6],
                                    }}
                                />}
                            </div>
                            <Text ta="center" color={isDarkMode ? "white" : "black"}>{folder.name}</Text>
                        </div>
                    ))
                ) : (
                    <Text className="search-error">Nevar atrast šādu mapi.</Text>
                )}
            </div>
            <Modal 
                centered
                opened={isModalOpen}
                onClose={() => setModalOpen(false)}
                title="Mapes parole">
                <PasswordInput
                    placeholder="Ievadi mapes paroli"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {errorMessage && <Text color="red">{errorMessage}</Text>}
                <Group position="right" mt="md">
                    <Button onClick={unlockFolder}>Atslēgt</Button>
                </Group>
            </Modal>
        </div>
    );
}
