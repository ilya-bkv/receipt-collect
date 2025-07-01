import './App.css'
import { ReceiptUploader } from './components/ReceiptUploader.tsx';
import {
  Stack,
  PinInput,
  Text,
  Title,
  Button,
  Badge,
  Group,
  CloseButton,
  Avatar,
  NumberFormatter
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import type { JettonBalance } from '@ton-api/client';
import ta from './tonapi';
import { Address } from '@ton/core';

const shortenAddress = (address: string, startLen = 6, endLen = 3): string => {
  if (address.length <= startLen + endLen + 3) return address;
  return `${address.slice(0, startLen)}…${address.slice(-endLen)}`;
}

function App() {
  const [pin, setPin] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isTonConnected, setIsTonConnected] = useState(false);
  const [jetton, setJetton] = useState<JettonBalance | null>(null);

  const [tonConnectUI] = useTonConnectUI();
  const connectedAddressString = useTonAddress();

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
        console.error('Ton connect error:', error);
      }
      return;
    }
  };

  useEffect(() => {
    if (!connectedAddressString) {
      setJetton(null);
      return;
    }

    ta.accounts
      .getAccountJettonsBalances(Address.parse(connectedAddressString))
      .then(res => {
        console.log('%c!!! getAccountJettonsBalances:', 'color: #bada55', res)
        const chk = res.balances.find((item: JettonBalance) => item.jetton.symbol === 'CHK');
        if (chk) setJetton(chk)
      })
      .catch(err => console.error(err.message || 'Failed to fetch jettons'));
  }, [connectedAddressString]);

  return (
    <>
      {isValid === true && isTonConnected && tonConnectUI.wallet && (
        <Group p={12} justify="right" w="100%" gap="xs" className="sticky-header">
          <Badge
            size="lg"
            variant="gradient"
            gradient={{from: 'indigo', to: 'cyan', deg: 90}}
          >
            {shortenAddress(connectedAddressString)}
          </Badge>
          <CloseButton onClick={() => tonConnectUI.disconnect()}/>
        </Group>
      )}
      <Stack
        bg="var(--mantine-color-body)"
        align="center"
        justify="center"
        gap="md"
      >
        <Title order={1} ta="center">Cheeki Earn</Title>

        {isValid === true && jetton && jetton.balance > 0 ? (
          <Stack gap="xs" mt={24}>
            <Text size="sm">
              Your goals:
            </Text>
            <Group gap="xs">
              <Avatar size="sm" src={jetton.jetton.image} alt={jetton.jetton.symbol}>
                {jetton.jetton.symbol}
              </Avatar>
              <Text size="lg" fw={500}>
                <NumberFormatter
                  suffix={` ${jetton.jetton.symbol}`}
                  value={Number(jetton.balance)}
                  thousandSeparator
                />
              </Text>
            </Group>
          </Stack>
        ) : (
          <img src="/logo.png" alt="Logo" style={{width: '100px', margin: '0 auto'}}/>
        )}

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
            {isTonConnected ? <ReceiptUploader/> :
              <Button color="dark" onClick={handleTonClick}>Connect TON Wallet to continue</Button>}
          </>
        )}
      </Stack>
    </>
  )
}

export default App
