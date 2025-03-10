import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateActiveComponent } from '../../actions/componentAction';
import { Button, Input, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import classes from "../../style/SearchInput.module.css"

export default function FolderContentUser() {
    const API_URL = process.env.REACT_APP_API_URL;
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
      const response = await fetch(`${API_URL}/api/check-folder/${folderName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ folder_name: folderName }),
        credentials:"include",  
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
      </div>

      {filteredFiles.length > 0 ? (
        <div className='image-previews'>
          {filteredFiles.map((file) => (
            <img
              key={extractFileName(file)}
              src={`${file}`}
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
