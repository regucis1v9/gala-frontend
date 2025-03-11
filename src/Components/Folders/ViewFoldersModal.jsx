import React, { useState, useEffect } from "react";
import { useDispatch } from 'react-redux';
import { updateImageLink } from '../../actions/imageActions';
import { Skeleton, Button, Input, useMantineTheme, Modal, Text, useMantineColorScheme } from "@mantine/core";
import classes from "../../style/SearchInput.module.css"; // Import your CSS module
import { IconSearch, IconFolderFilled } from "@tabler/icons-react";

export default function ViewFoldersModal({ selectedButtonId, closeModal }) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const dispatch = useDispatch();
  const [folders, setFolders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const token = localStorage.getItem('token');
    const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/listFolders`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setFolders(data.folders);
        setIsLoadingFolders(false);
      })
      .catch((error) => {
        console.error("Error fetching folder list:", error);
        setIsLoadingFolders(false);
      });
  }, [token]);

  const fetchFiles = async (folderName) => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch(`${API_URL}/api/retrieveFiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ folder_name: folderName }),
      });

      if (!response.ok) {
        throw new Error('Error finding files');
      }

      const data = await response.json();
      setFiles(data.files || []);
      setSelectedFolder(folderName);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    fetchFiles(folder);
  };

  const handleImageClick = (imageLink) => {
    dispatch(updateImageLink(selectedButtonId, imageLink));
    closeModal();
  };

    const filteredFolders = folders.filter(folder =>
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="manage-main">
      {selectedFolder ? (
        <div>
          <Button ml={20} onClick={() => setSelectedFolder(null)}>Atpakaļ</Button>
          <Text ta="left" ml={20} mt={20} fz={32} fw={600} color={isDarkMode ? "white" : "black"}>{selectedFolder.name}</Text>
          {isLoadingFiles ? (
            <div className="folder-main">
              <Skeleton w={100} h={100}></Skeleton>
              <Skeleton w={100} h={100}></Skeleton>
              <Skeleton w={100} h={100}></Skeleton>
              <Skeleton w={100} h={100}></Skeleton>
              <Skeleton w={100} h={100}></Skeleton>
            </div>
          ) : (
            <div className="folder-main">
              {files.length > 0 ? (
                files.map((file, index) => (
                  <img
                    key={index}
                    src={`${file}`}
                    alt={`File ${file}`}
                    className="preview-image"
                    onClick={() => handleImageClick(`${file}`)}
                  />
                ))
              ) : (
                <Text className="screen-search-error" ta="center" color={isDarkMode ? "white" : "black"}>Šajā mapē nav failu.</Text>
              )}
            </div>
          )}
        </div>
      ) : (
          <>
              <div className="search-bar">
                  <Input
                      placeholder='Meklēt mapes...'
                      classNames={{wrapper: classes.maxWidth}}
                      leftSection={<IconSearch/>}
                      size='md'
                      variant="filled"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.currentTarget.value)}
                  />
              </div>
              <div className="folder-main">
                  {isLoadingFolders ? (
                      <>
                          <Skeleton w={100} h={100}></Skeleton>
                          <Skeleton w={100} h={100}></Skeleton>
                          <Skeleton w={100} h={100}></Skeleton>
                          <Skeleton w={100} h={100}></Skeleton>
                          <Skeleton w={100} h={100}></Skeleton>
                      </>
                  ) : (
                      filteredFolders.map((folder, index) => (
                          <button
                              key={index}
                              className="screen-button"
                              onClick={() => handleFolderClick(folder.name)}
                          >
                              <div title={folder.name}> {/* Use folder.name here */}
                                  <div className="folder-icon">
                                      <IconFolderFilled size={60}
                                                        color={isDarkMode ? theme.colors.blue[8] : theme.colors.blue[6]}/>
                                  </div>
                                  <Text w={70} ta="center"
                                        color={isDarkMode ? "white" : "black"}>{folder.name}</Text> 
                              </div>
                          </button>
                      ))
                  )}
              </div>
          </>
      )}
    </div>
  );
}
