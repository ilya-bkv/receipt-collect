import './App.css'
import { Stack, PinInput, Text, Title, Button } from '@mantine/core';
import { useEffect, useState } from 'react';
import { ReceiptUploader } from './components/ReceiptUploader.tsx';
import { useTonConnectUI } from '@tonconnect/ui-react';

function App() {
  const [pin, setPin] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isTonConnected, setIsTonConnected] = useState(false);

  const [tonConnectUI] = useTonConnectUI();

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

  useEffect(() => {
    if (tonConnectUI.connected && tonConnectUI.wallet) {
      setIsTonConnected(true);
    }

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        setIsTonConnected(true);
      } else {
        setIsTonConnected(false);
      }
    });
    return () => unsubscribe();
  }, [tonConnectUI]);

  const handleTonClick = async () => {
    if (!isTonConnected) {
      try {
        await tonConnectUI.openModal();
      } catch (error) {
        console.error("Ton connect error:", error);
      }
      return;
    }
  };

  return (
    <>
      <Stack
        bg="var(--mantine-color-body)"
        align="center"
        justify="center"
        gap="md"
      >
        <Title order={1} ta="center">Cheeki Earn</Title>

        {isTonConnected && (
          <p>TON CONECTED</p>
        )}

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
          <>
            <Button color="dark" onClick={handleTonClick}>Connect TON Wallet to continue</Button>
            {isTonConnected && (<ReceiptUploader/>)}
          </>
        )}
      </Stack>
    </>
  )
}

export default App
