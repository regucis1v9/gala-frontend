import { useDisclosure } from '@mantine/hooks';
import { Modal, Button } from '@mantine/core';

export default function Popup() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Authentication"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        
      </Modal>

      <Button onClick={open}>Open modal</Button>
    </>
  );
}