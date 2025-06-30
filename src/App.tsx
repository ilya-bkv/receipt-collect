import './App.css'
import { Stack, PinInput, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { ReceiptUploader } from './components/ReceiptUploader.tsx';


function App() {
  const [pin, setPin] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handlePinChange = (value: string) => {
    setPin(value);

    if (value.length === 4) {
      setIsValid(value === import.meta.env.VITE_PIN_CODE);
    } else {
      setIsValid(null);
    }
  };

  useEffect(() => {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    Telegram.WebApp.lockOrientation();
  }, []);

  return (
    <>
      <Stack
        bg="var(--mantine-color-body)"
        align="stretch"
        justify="center"
        gap="md"
      >
        <img src="/logo.png" alt="Logo" style={{ width: '100px', margin: '0 auto' }} />
        {(isValid === null || !isValid) && (
          <>
            <Text size="lg">
              Hello {Telegram.WebApp.initDataUnsafe.user?.username}, enter the PIN
            </Text>
            <PinInput
              size="md"
              placeholder="?"
              type="number"
              length={4}
              value={pin}
              onChange={handlePinChange}
              error={isValid === false}
            />
          </>
        )}
        {isValid === false && (
          <Text c="red" ta="center">Invalid PIN. Please try again.</Text>
        )}
        {isValid === true && (
          <ReceiptUploader/>
        )}
      </Stack>
    </>
  )
}

export default App
