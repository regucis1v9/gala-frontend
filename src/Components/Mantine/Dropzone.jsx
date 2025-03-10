import { useRef } from 'react';
import { Text, Group, Button, rem, useMantineTheme } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconCloudUpload, IconX, IconDownload } from '@tabler/icons-react';
import classes from '../../style/DropzoneButton.module.css';

export default function DropzoneArea({ files, setFiles, selectedFolder }) {
  const theme = useMantineTheme();
  const openRef = useRef(null);

  // Handle the drop event
  const handleDrop = (newFiles) => {
    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles, ...newFiles];
      const imagePreviews = updatedFiles.map(file =>
        file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      ).filter(preview => preview !== null);

      // Revoke previous object URLs to free up memory
      updatedFiles.forEach(preview => URL.revokeObjectURL(preview));
      return updatedFiles;
    });
  };

  return (
    <div className={classes.wrapper}>
      <Dropzone
        openRef={openRef}
        onDrop={handleDrop}
        className={classes.dropzone}
        radius="md"
        accept={[
          MIME_TYPES.png,
          MIME_TYPES.jpeg,
          MIME_TYPES.svg,
          MIME_TYPES.gif,
          MIME_TYPES.gif,
          MIME_TYPES.webp,
          MIME_TYPES.avif,
          MIME_TYPES.heic,
          MIME_TYPES.heif,
          MIME_TYPES.gif,
          MIME_TYPES.mp4,
        ]}
        maxSize={50000000}
        maxFiles={100} 
      >
        <div style={{ pointerEvents: 'none' }}>
          <Group justify="center">
            <Dropzone.Accept>
              <IconDownload
                style={{ width: rem(50), height: rem(50) }}
                color={theme.colors.blue[6]}
                stroke={1.5}
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX
                style={{ width: rem(50), height: rem(50) }}
                color={theme.colors.red[6]}
                stroke={1.5}
              />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconCloudUpload style={{ width: '50px', height: '50px' }} stroke={1.5} />
            </Dropzone.Idle>
          </Group>

          <Text ta="center" fw={700} fz="lg" mt="xl" className={classes.textWidth}>
            <Dropzone.Accept>Ievelc failus šeit</Dropzone.Accept>
            <Dropzone.Reject>Failiem jāūt ne vairāk par 2MB</Dropzone.Reject>
            <Dropzone.Idle>Augšupielādē failus {selectedFolder} mapē</Dropzone.Idle>
          </Text>
          <Text ta="center" fz="sm" mt="xs" c="dimmed" className={classes.textWidth}>
            Ievelc failus lai augšupielādētu tos. Sistēma atļauj <i>.png, .jpg, .jpeg, .svg</i> failus, kas ir līdz 50MB.
          </Text>
        </div>
      </Dropzone>

      <Button className={classes.control} size="md" radius="xl" onClick={() => openRef.current?.()}>
        Izvēlēties failus
      </Button>
    </div>
  );
}
