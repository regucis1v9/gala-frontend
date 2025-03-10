import React, { useEffect, useState } from "react";
import { Skeleton, Modal, Button, TextInput, PasswordInput, Text, Select, Input, ScrollArea, Group, Table } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { IconSearch, IconEdit, IconTrashFilled } from '@tabler/icons-react';
import classes from "../../style/SearchInput.module.css";
import { Link } from "react-router-dom";
import {showNotification, updateNotification} from "@mantine/notifications";
import {IconCheck, IconX} from "@tabler/icons-react";

export default function ViewUsers() {
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userToDelete, setUserToDelete] = useState(null); 
    const [userToEdit, setUserToEdit] = useState(null); 
    const token = localStorage.getItem('token');
    const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
    const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [isFormValid, setIsFormValid] = useState(false);

    const form = useForm({
        initialValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: '',
        },
        validate: {
            username: (value) => (value.length < 2 ? 'Vārds jābūt vismaz 2 simboliem' : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Nederīgs epasts'),
            password: (value) => (value && value.length > 0 && value.length < 6 ? 'Parolei jābūt vismaz 6 simboliem' : null),
            confirmPassword: (value, values) =>
                value && value !== values.password ? 'Paroles nesakrīt' : null,
        },
        validateInputOnChange: true,
    });

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost/api/getAllUsers', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                showNotification({
                    id: "fetching",
                    color: 'red',
                    autoClose: false,
                    title: "Radās kļūda atlasot lietotāju.",
                    loading: false,
                    icon: <IconX size={18} />
                });
                const errorData = await response.json();
                throw new Error(errorData.message || 'Tīkla vai iekšēja servera kļūda');
            }

            const data = await response.json();
            setAllUsers(data.users || []);
        } catch (error) {
            showNotification({
                id: "fetching",
                color: 'red',
                autoClose: false,
                title: "Radās kļūda atlasot lietotāju.",
                loading: false,
                icon: <IconX size={18} />
            });
            console.error('Error fetching users:', error);
            setAllUsers([]); 
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        const newUsersList = allUsers.filter(user => user.id !== userToDelete.id);
        setAllUsers(newUsersList);

        try {
            showNotification({
                id: 'deleting',
                autoClose: false,
                title: "Veic lietotāja dzēšanu...",
                loading: true
            });
            const response = await fetch('http://localhost/api/deleteUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: userToDelete.id }),
            });

            if (!response.ok) {
                updateNotification({
                    id: "deleting",
                    color: 'red',
                    autoClose: false,
                    title: "Radās kļūda dzēšot lietotāju.",
                    loading: false,
                    icon: <IconX size={18} />
                });
                throw new Error('Tīkla vai iekšēja servera kļūda');
            }
            const data = await response.json();
            setAllUsers(data.users || []);
            setUserToDelete(null);
            closeDeleteModal();
            updateNotification({
                id: "deleting",
                color: 'teal',
                autoClose: true,
                title: "Lietotājs izdzēsts veiksmīgi!",
                loading: false,
                icon: <IconCheck size={18} />
            });
        } catch (error) {
            updateNotification({
                id: "deleting",
                color: 'red',
                autoClose: false,
                title: "Radās kļūda dzēšot lietotāju.",
                loading: false,
                icon: <IconX size={18} />
            });
            console.error('Error deleting user:', error);
            setAllUsers(prevUsers => [...prevUsers, userToDelete]);
        }
    };

    const handleEdit = async (values) => {
        if (!userToEdit) return;

        try {
            showNotification({
                id: 'saving',
                autoClose: false,
                title: "Veic lietotāja saglabāšanu...",
                loading: true
            });
            const requestData = {
                id: userToEdit.id,
                name: values.username,
                email: values.email,
                role: values.role,
            };

            if (values.password) {
                requestData.password = values.password;
            }

            const response = await fetch('http://localhost/api/editUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestData), // ✅ Ensure JSON formatting
            });

            const data = await response.json();

            if (!response.ok) {
                updateNotification({
                    id: "saving",
                    color: 'red',
                    autoClose: false,
                    title: "Radās kļūda saglabājot izmaiņas.",
                    loading: false,
                    icon: <IconX size={18} />
                });
                console.error('Validation errors:', data.errors);
                throw new Error(data.message || 'Tīkla vai iekšēja servera kļūda');
            }
            updateNotification({
                id: "saving",
                color: 'teal',
                autoClose: true,
                title: "Lietotājs veiksmīgi autjaunināts.",
                loading: false,
                icon: <IconCheck size={18} />
            });
            setAllUsers(data.users || []);
            setUserToEdit(null);
            handleCloseEditModal();
        } catch (error) {
            updateNotification({
                id: "saving",
                color: 'red',
                autoClose: false,
                title: "Radās kļūda saglabājot lietotāju.",
                loading: false,
                icon: <IconX size={18} />
            });
            console.error('Error editing user:', error);
        }

    };

    const filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteButtonClick = (user) => {
        setUserToDelete(user);
        openDeleteModal();
    };

    const handleEditButtonClick = (user) => {
        setUserToEdit(user);
        form.setValues({ 
            username: user.name, 
            email: user.email,
            role: user.role, 
        });
        form.validate();
        openEditModal();
    };

    const resetFormState = () => {
        form.reset(); 
        setIsFormValid(false); 
    };

    const handleCloseEditModal = () => {
        resetFormState(); 
        closeEditModal();
        setUserToEdit(null); 
    };

    useEffect(() => {
        const isValid =
            Object.values(form.errors).every(error => !error) &&
            Object.entries(form.values).every(([key, value]) => {
                if (key === "password" || key === "confirmPassword") {
                    return true; 
                }
                return value !== "";
            });

        setIsFormValid(isValid);
    }, [form.values, form.errors]);


    return (
        <div className="view-user-content">
            <div className="search-bar">
                <Input 
                    placeholder="Lietotāja lietotājvārds..."
                    variant="filled"
                    classNames={{ wrapper: classes.maxWidth }} 
                    leftSection={<IconSearch size={18} />} 
                    size='md' 
                    onChange={(e) => setSearchTerm(e.currentTarget.value)}
                />
                <Link to="/dashboard/createUser">
                    <Button size='md'>Pievienot lietotāju</Button>
                </Link>
            </div>

            {loading ? (
                <div className="user-links">
                    {[...Array(10)].map((_, index) => (
                        <Skeleton key={index} radius="md" height="65px" width="100%" />
                    ))}
                </div>
            ) : filteredUsers.length > 0 ? (
                <ScrollArea style={{ height: '300px' }}>
                    <Table miw={700}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th ta="center">Lietotājvārds</Table.Th>
                                <Table.Th ta="center">E-pasts</Table.Th>
                                <Table.Th ta="center">Pieejas līmenis</Table.Th>
                                <Table.Th ta="center"></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filteredUsers.map((user) => (
                                <Table.Tr key={user.id}>
                                    <Table.Td ta="center">{user.name}</Table.Td>
                                    <Table.Td ta="center">{user.email}</Table.Td>
                                    <Table.Td ta="center">{user.role}</Table.Td>
                                    <Table.Td>
                                        <Group justify="center">
                                            <Button onClick={() => handleEditButtonClick(user)} variant="filled" size="xs" title="Rediģēt">
                                                <IconEdit size={16} />
                                            </Button>
                                            <Button color="red" onClick={() => handleDeleteButtonClick(user)} variant="filled" size="xs" title="Dzēst">
                                                <IconTrashFilled size={16} />
                                            </Button>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            ) : (
                <Text className="screen-search-error">Nevar atrast šādu ekrānu.</Text>
            )}

            <Modal 
                opened={deleteModalOpened} 
                onClose={closeDeleteModal} 
                title="Apstiprināt dzēšanu" 
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
                centered>
                <Text>Vai tiešām vēlaties dzēst lietotāju <strong>{userToDelete?.name}</strong> ?</Text>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={handleDelete} color="red">Apstiprināt</Button>
                    <Button variant="outline" onClick={closeDeleteModal} color="dark">Atcelt</Button>
                </div>
            </Modal>

            <Modal 
                opened={editModalOpened} 
                onClose={handleCloseEditModal} 
                title="Rediģēt lietotāju"
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }} 
                centered>
                <form onSubmit={form.onSubmit(handleEdit)}>
                    <TextInput
                        label="Lietotājvārds"
                        placeholder="Ievadiet lietotāja vārdu"
                        {...form.getInputProps('username')}
                    />
                    <TextInput
                        label="Epasts"
                        placeholder="Ievadiet lietotāja epastu"
                        {...form.getInputProps('email')}
                    />
                    <Select
                        label="Loma"
                        placeholder="Izvēlieties lomu"
                        {...form.getInputProps('role')}
                        data={[
                            { value: 'Administrātors', label: 'Administrātors' },
                            { value: 'Lietotājs', label: 'Lietotājs' },
                        ]}
                    />
                    <PasswordInput
                        label="Jauna parole"
                        placeholder="Ievadiet jaunu paroli (ja nepieciešams)"
                        {...form.getInputProps('password')}
                    />
                    <PasswordInput
                        label="Apstipriniet paroli"
                        placeholder="Apstipriniet paroli"
                        {...form.getInputProps('confirmPassword')}
                    />
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <Button type="submit" color="blue" disabled={!isFormValid}>Saglabāt</Button>
                        <Button variant="outline" onClick={handleCloseEditModal} color="dark">Atcelt</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
