import cx from 'clsx';
import { ActionIcon, useMantineColorScheme, useComputedColorScheme, Group, Button } from '@mantine/core';
import { IconSun, IconMoon, IconLogout } from '@tabler/icons-react';
import classes from '../../style/ActionToggle.module.css';

export default function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    fetch('http://localhost/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    })
    .then((response) => {
      if (response.ok) {
        localStorage.removeItem('token')
        console.log('Successfully logged out');
        window.location.href = '/'; // Redirect to login page
      } else {
        console.error('Logout failed');
      }
    })
    .catch((error) => {
      console.error('Error during logout:', error);
    });
  };

  return (
    <Group justify="center" classNames={{ root: classes.logoutGroup }}>
      <Button
        size='md'
        color='red'
        rightSection={<IconLogout size={24} stroke={1.5} />}
        onClick={handleLogout} // Add onClick to call the logout function
      >
        Atslēgties
      </Button>

      <ActionIcon
        onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
        variant="default"
        size="xl"
        aria-label="Toggle color scheme"
      >
        {computedColorScheme === 'dark' ? (
          <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
        ) : (
          <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
        )}
      </ActionIcon>
    </Group>
  );
}
