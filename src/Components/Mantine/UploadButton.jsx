import React, { useState } from 'react';
import { Button, Progress, useMantineTheme } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import classes from '../../style/ButtonProgress.module.css';

export default function UploadButton({ onUpload }) {
  const theme = useMantineTheme();
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const interval = useInterval(
    () =>
      setProgress((current) => {
        if (current < 100) {
          return current + 1;
        }

        interval.stop();
        setLoaded(true);
        return 0;
      }),
    20
  );

  const handleClick = () => {
    if (loaded) {
      setLoaded(false);
    } else if (!interval.active) {
      interval.start();
      onUpload(); // Call the onUpload prop when the upload starts
    }
  };

  return (
    <Button
      fullWidth
      className={classes.button}
      onClick={handleClick}
    >
      <div className={classes.label}>
        Augšupielādē failus
      </div>
      {progress > 0 && <Progress value={progress} />}
    </Button>
  );
}
