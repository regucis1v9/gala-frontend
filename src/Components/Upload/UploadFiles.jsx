import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateActiveComponent } from '../../actions/componentAction';
import { Select, ActionIcon, Button } from '@mantine/core';
import UploadButton from '../Mantine/UploadButton';
import DropzoneArea from '../Mantine/Dropzone';
import { showNotification, updateNotification } from '@mantine/notifications';
import { IconX, IconCheck } from '@tabler/icons-react';
import dropdown from '../../style/ContainedInput.module.css';
export default function UploadFiles() {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [files, setFiles] = useState([]); // State to hold uploaded files
  const [previews, setPreviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');
    const API_URL = process.env.REACT_APP_API_URL;


    useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(`${API_URL}/api/listFolders`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setFolders(Array.isArray(data.folders) ? data.folders : []);
      } catch (error) {
        console.error('Error fetching folders:', error);
        setFolders([]);
      }
    };

    fetchFolders();
  }, [token]);

  useEffect(() => {
    dispatch(updateActiveComponent('upload'));
  }, [dispatch]);

  const handleFolderChange = (value) => {
    setSelectedFolder(value);
  };

  const handleImageClick = (preview, index) => {
    setSelectedImage(preview);
    setSelectedIndex(index)
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };
    const handleRemoveImage = () => {
        if (selectedIndex === null) return;

        setFiles((prevFiles) => prevFiles.filter((_, index) => index !== selectedIndex));
        setPreviews((prevPreviews) => prevPreviews.filter((_, index) => index !== selectedIndex));
        setSelectedImage(null);
        setSelectedIndex(null);
    };

  const handleFileUpload = async () => {
    if (!selectedFolder || files.length === 0) {
        showNotification({
            color:"red",
            autoClose: true,
            title: "Jāizvēlas vismaz viens fails!",
            icon: <IconX size={18}/>
        });

      return;
    }

    const formData = new FormData();
    formData.append('folder_name', selectedFolder);

    files.forEach((file) => {
      const trimmedFileName = file.name.replace(/\s+/g, '_');
      const trimmedFile = new File([file], trimmedFileName, { type: file.type });
      formData.append(`files[]`, trimmedFile);
    });

    try {
        showNotification({
            id:"uploading-file",
            autoClose: false,
            title: "Augšupielādē failus...",
            loading: true
        });
      const response = await fetch(`${API_URL}/api/uploadFiles`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
          updateNotification({
              id:"uploading-file",
              color:'red',
              autoClose: true,
              title: "Augšupielāde neizdevās.",
              loading: false,
              icon: <IconX size={18}/>
          });
        throw new Error('File upload failed');
      }

      const data = await response.json();
      console.log('Upload successful:', data);
        updateNotification({
            id:"uploading-file",
            color: 'teal',
            autoClose: true,
            title: "Augšupielāde izdevās!",
            loading: false,
            icon: <IconCheck size={18}/>
        });

      setFiles([]); // Clear files after upload
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  return (
    <div className='width100'>
      {!selectedFolder ? (
        <div className='folder-selector-wrapper'>
          <Select
            label="Izvēlies mapi, lai turpinātu"
            id="folderSelect"
            value={selectedFolder}
            onChange={handleFolderChange}
            data={folders.map(folder => ({ value: folder.name, label: folder.name }))}
            placeholder="Mape nav izvēlēta"
            classNames={dropdown}
            variant='filled'
          />
        </div>
      ) : (
        <div>
          <DropzoneArea files={files} setFiles={setFiles} selectedFolder={selectedFolder}/> 
          <div className="submit-wrapper">
            <UploadButton onUpload={handleFileUpload} />
          </div>
          <div className='image-previews'>
            {files.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt={`Preview ${index}`}
                className='preview-image'
                onClick={() => handleImageClick(URL.createObjectURL(file), index)}
              />
            ))}
          </div>
          {selectedImage && (
            <div className='modal' onClick={handleCloseModal}>
                <Button
                    variant={"filled"}
                    color={"red"}
                    style={{ position: 'absolute', top: '10px', left: '10px', zIndex: '10' }}
                    onClick={() => handleRemoveImage()}
                >
                    Noņemt attēlu
                </Button>
              <img src={selectedImage} alt="Full size" className='modal-image' />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
