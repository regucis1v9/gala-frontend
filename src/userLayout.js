import { AppShell } from '@mantine/core';
import React from 'react';

export default function UserLayout({ children }) {
  
  return (
    <AppShell>
      <AppShell.Main>
        {children} {/* Only render children if authenticated */}
      </AppShell.Main>
    </AppShell>
  );
}

