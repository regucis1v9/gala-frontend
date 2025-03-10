import cx from 'clsx';
import { useState, useEffect } from 'react';
import { Table, ScrollArea } from '@mantine/core';
import classes from '../style/TableScrollArea.module.css';

export default function Test() {
  const [users, setUsers] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const token = localStorage.getItem('token');

  // Fetch user data from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost/api/getAllUsers', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();

        // Check if the response is successful
        if (data.status === 200) {
          setUsers(data.users);
        } else {
          console.error('Error fetching users:', data.message);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchUsers();
  }, []); // Empty dependency array means this runs once when the component mounts

  // Map users to table rows
  const rows = users.map((user) => (
    <Table.Tr key={user.id}>
      <Table.Td>{user.name}</Table.Td>
      <Table.Td>{user.email}</Table.Td>
      <Table.Td>{user.role}</Table.Td> {/* Use 'role' instead of 'company' */}
    </Table.Tr>
  ));

  return (
    <ScrollArea h={300} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={700}>
        <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Role</Table.Th> {/* Change header to 'Role' */}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
