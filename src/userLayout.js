import { AppShell } from '@mantine/core';
import React from 'react';

export default function UserLayout({ children }) {
  
  return (
    <AppShell>
      <AppShell.Main>
        {children} {}
      </AppShell.Main>
    </AppShell>
  );
}

