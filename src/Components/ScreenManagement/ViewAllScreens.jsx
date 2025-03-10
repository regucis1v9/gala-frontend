import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateActiveComponent } from '../../actions/componentAction';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Modal, Text } from '@mantine/core';
import {IconSearch, IconDeviceTv, IconMinus, IconX, IconCheck} from '@tabler/icons-react';
import classes from "../../style/SearchInput.module.css";
import {showNotification, updateNotification} from "@mantine/notifications";


export default function ViewAllScreens() {
    const API_URL = process.env.REACT_APP_API_URL;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [screens, setScreens] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [screenToDelete, setScreenToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        dispatch(updateActiveComponent('manage'));
        fetchScreens();
    }, [dispatch]);

    const fetchScreens = async () => {
        try {
            const response = await fetch(`${API_URL}/api/getAllScreens`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                showNotification({
                    id: "fetching",
                    color: 'red',
                    autoClose: false,
                    title: "Radās kļūda atlasot failus.",
                    loading: false,
                    icon: <IconX size={18} />
                });
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setScreens(data);
        } catch (error) {
            showNotification({
                id: "fetching",
                color: 'red',
                autoClose: false,
                title: "Radās kļūda atlasot failus.",
                loading: false,
                icon: <IconX size={18} />
            });
        }
    };

    const deleteScreen = async (id) => {
        try {
            showNotification({
                id: 'deleting',
                autoClose: false,
                title: "Dzēš failus...",
                loading: true
            });
            const response = await fetch(`${API_URL}/api/deleteScreen`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                updateNotification({
                    id: "deleting",
                    color: 'red',
                    autoClose: false,
                    title: "Radās kļūda dzēšot ekrānu.",
                    loading: false,
                    icon: <IconX size={18} />
                });
                throw new Error('Failed to delete screen');
            }
            updateNotification({
                id: "deleting",
                color: 'teal',
                autoClose: true,
                title: "Ekrāns izdzēsts veiksmīgi!",
                loading: false,
                icon: <IconCheck size={18} />
            });
            setScreens((prevScreens) => prevScreens.filter(screen => screen.id !== id));
            setShowDeleteModal(false); // Close the modal after deletion
        } catch (error) {
            updateNotification({
                id: "deleting",
                color: 'red',
                autoClose: false,
                title: "Radās kļūda dzēšot ekrānu.",
                loading: false,
                icon: <IconX size={18} />
            });
            console.error('Error deleting screen:', error);
        }
    };

    const handleScreenClick = (id) => {
        navigate(`/dashboard/manageScreen/${id}`);
    };

    const handleDeleteButtonClick = (screen) => {
        setScreenToDelete(screen);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (screenToDelete) {
            deleteScreen(screenToDelete.id);
        }
    };

    const addScreen = async () => {
        try {
            showNotification({
                id: 'creating',
                autoClose: false,
                title: "Izveido ekrānu...",
                loading: true
            });
            const response = await fetch(`${API_URL}/api/addScreen`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                updateNotification({
                    id: "creating",
                    color: 'red',
                    autoClose: false,
                    title: "Radās kļūda izveidotjot ekrānu.",
                    loading: false,
                    icon: <IconX size={18} />
                });
                throw new Error('Failed to delete screen');
            }
            updateNotification({
                id: "creating",
                color: 'teal',
                autoClose: true,
                title: "Ekrāns izveidots veiksmīgi!",
                loading: false,
                icon: <IconCheck size={18} />
            });

            // Refetch screens after adding a new one
            fetchScreens();
        } catch (error) {
            updateNotification({
                id: "creating",
                color: 'red',
                autoClose: false,
                title: "Radās kļūda izveidotjot ekrānu.",
                loading: false,
                icon: <IconX size={18} />
            });
            console.error('Error adding screen:', error);
        }
    };

    const filteredScreens = screens.filter(screen =>
        screen.table_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="manage-main">
            <div className="search-bar">
                <Input
                    placeholder='Ekrāna nosakums...'
                    classNames={{ wrapper: classes.maxWidth }}
                    leftSection={<IconSearch size={18} />}
                    size='md'
                    onChange={(e) => setSearchTerm(e.target.value)} // Added onChange for search functionality
                    variant='filled'
                />
                <Button onClick={addScreen} size='md'>Pievienot ekrānu</Button>
            </div>

            {filteredScreens.length > 0 ? (
                <div className="screen-links">
                    {filteredScreens.map((screen) => (
                        <div key={screen.id} className="screen-button">
                            <button className='red' onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteButtonClick(screen);
                            }}>
                                <IconMinus size={20} stroke={3} color='white' />
                            </button>
                            <IconDeviceTv size={100} />
                            <Text ta="center">{screen.table_name}</Text>
                        </div>
                    ))}
                </div>
            ) : (
                <Text className='screen-search-error'>Nevar atrast šādu ekānu.</Text>
            )}

            <Modal
                centered
                opened={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title={`Dzēst "${screenToDelete?.table_name}"?`}
            >
                <Text>Ekrāns tiks izdzēsts mūžīgi.</Text>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    <Button color="red" onClick={confirmDelete}>Jā, izdzēst</Button>
                    <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Atcelt</Button>
                </div>
            </Modal>
        </div>
    );
}
