import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateActiveComponent } from '../../actions/componentAction';
import { Button, Input, Text } from '@mantine/core';
import {IconCheck, IconSearch, IconX} from '@tabler/icons-react';
import classes from "../../style/SearchInput.module.css"
import {showNotification, updateNotification} from "@mantine/notifications";

export default function ViewFolderContent() {
  const { folderName } = useParams();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteImages, setDeleteImages] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const token = localStorage.getItem('token');
  const dispatch = useDispatch();
  

  useEffect(() => {
    dispatch(updateActiveComponent('view'));
  }, [dispatch]);

    const fetchFiles = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost/api/retrieveFiles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization':`Bearer ${token}`
                },
                body: JSON.stringify({ folder_name: folderName }),
                credentials: 'include',  // Ensure cookies are included in the request
            });

            if (!response.ok) {
                throw new Error('Error finding files');
            }

            const data = await response.json();
            setFiles(data.files || []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };



    useEffect(() => {
    fetchFiles();
  }, [folderName]);

  const extractFileName = (fileUrl) => {
    return fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
  };

  const handleImageClick = (fileUrl) => {
    const fileName = extractFileName(fileUrl);

    if (!deleteImages) {
      setSelectedImage(fileUrl);
    } else {
      setImagesToDelete((prevImages) => {
        if (prevImages.includes(fileName)) {
          return prevImages.filter((image) => image !== fileName);
        } else {
          return [...prevImages, fileName];
        }
      });
    }
  };

    const deleteFiles = async () => {
        try {
            showNotification({
                id: 'deleting',
                autoClose: false,
                title: "Dzēš failus...",
                loading: true
            });
            const response = await fetch('http://localhost/api/deleteFiles', { // Fixed typo in URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    folder_name: folderName,
                    files: imagesToDelete,
                }),
            });

            if (!response.ok) {
                let errorMessage = "Nezināma kļūda. Ja tā turpinās, sazināties ar skolas IT speciālistu.";

                try {
                    const errorData = await response.json();
                    if (errorData && errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (jsonError) {
                    if (response.status === 404) {
                        errorMessage = "Lapa nav atrasta. Pārbaudiet API adresi.";
                    } else if (response.status === 500) {
                        errorMessage = "Servera kļūda. Mēģiniet vēlreiz vēlāk.";
                    }
                }

                updateNotification({
                    id: "deleting",
                    color: 'red',
                    autoClose: true,
                    title: "Neizdevās dzēst failus.",
                    message: errorMessage,
                    loading: false,
                    icon: <IconX size={18} />
                });

                return;
            }

            updateNotification({
                id: "deleting",
                color: 'teal',
                autoClose: true,
                title: "Dzēšana veiksmīga!",
                loading: false,
                icon: <IconCheck size={18} />
            });

            setFiles((prevFiles) =>
                prevFiles.filter(file => !imagesToDelete.includes(extractFileName(file)))
            );
        } catch (error) {
            updateNotification({
                id: 'deleting',
                color: 'red',
                autoClose: false,
                title: "Tīkla kļūda",
                message: "Nevar izveidot savienojumu ar serveri. Pārbaudiet interneta savienojumu vai mēģiniet vēlreiz.",
                icon: <IconX size={18} />
            });
        } finally {
            setDeleteImages(false);
            setImagesToDelete([]);
        }
    };


    const handleRedButton = () => {
    if (deleteImages) {
      if (imagesToDelete.length > 0) {
        deleteFiles();
      } else {
        setDeleteImages(false);
      }
    } else {
      setDeleteImages(true);
    }
  };

  const handleBlueButton = () => {
    if (deleteImages) {
      setDeleteImages(false);
      setImagesToDelete([]); 
    }
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const filteredFiles = files.filter(file =>
    file.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="content-main">
      <div className="search-bar">
      <Input 
        placeholder='Attēla nosakums...'
        classNames={{ wrapper: classes.maxWidth }} 
        leftSection={<IconSearch size={18} />} 
        size='md' 
        variant="filled"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
        />
        <Button onClick={handleRedButton} size='md'>
          {deleteImages 
            ? (imagesToDelete.length > 0 ? "Apstiprināt dzēšanu" : "Atcelt dzēšanu") 
            : "Dzēst failus"}
        </Button>
      </div>

      {filteredFiles.length > 0 ? (
        <div className='image-previews'>
          {filteredFiles.map((file) => (
            <img
              key={extractFileName(file)}
              src={`http://localhost${file}`}
              alt={`File ${extractFileName(file)}`}
              className={`preview-image ${deleteImages && imagesToDelete.includes(extractFileName(file)) ? 'clicked-image' : ''}`}
              onClick={() => handleImageClick(file)}
            />
          ))}
        </div>
      ) : (
        <div className='screen-search-error'>{searchTerm ? "Nevar atrast failu ar tādu nosaukumu" : "Šī mape ir tukša"}</div>
      )}

      {selectedImage && !deleteImages && (
        <div className='modal' onClick={handleCloseModal}>
          <img src={`http://localhost${selectedImage}`} alt="Full size" className='modal-image' />
        </div>
      )}
    </div>
  );
}
