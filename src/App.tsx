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
  NumberFormatter, LoadingOverlay
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import type { JettonBalance } from '@ton-api/client';
import ta from './tonapi';
import { Address } from '@ton/core';
import axios from 'axios';
import ReactConfetti from 'react-confetti';
// import receipt from './assets/mock.json'

const shortenAddress = (address: string, startLen = 6, endLen = 3): string => {
  if (address.length <= startLen + endLen + 3) return address;
  return `${address.slice(0, startLen)}…${address.slice(-endLen)}`;
}

const generateRandomId = () =>
  `${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`

function App() {
  const [pin, setPin] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isTonConnected, setIsTonConnected] = useState(false);
  const [jetton, setJetton] = useState<JettonBalance | null>(null);
  const [jettonBalance, setJettonBalance] = useState<number>(0);
  const [receiptsCount, setReceiptsCount] = useState<number>(0);
  const [isReceiptDataParsed, setIsReceiptDataParsed] = useState<boolean>(false);
  const [isReceiptDataMustCleared, setIsReceiptDataMustCleared] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [tonConnectUI] = useTonConnectUI();
  const connectedAddressString = useTonAddress();
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const clearData = () => {
    setIsReceiptDataParsed(false);
    setReceipt(null)
    setIsReceiptDataMustCleared(true)
  }

  const handlePinChange = (value: string) => {
    setPin(value);

    if (value.length === 4) {
      setIsValid(value === import.meta.env.VITE_PIN_CODE);
    } else {
      setIsValid(null);
    }
  };

  const fetchReceipts = async () => {
    if (Telegram.WebApp.initDataUnsafe.user?.id) {
      try {
        const response = await axios.get(`/api/receipts/user/${Telegram.WebApp.initDataUnsafe.user.id}`);
        console.log('!!! api/receipts/user:', response);
        if (response.data && Array.isArray(response.data)) {
          setReceiptsCount(response.data.length);
          console.log('Receipts count:', response.data.length);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    Telegram.WebApp.lockOrientation();

    fetchReceipts();
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
        if (chk) {
          setJetton(chk);
          setJettonBalance(Number(chk.balance));
        }
      })
      .catch(err => console.error(err.message || 'Failed to fetch jettons'));

  }, [connectedAddressString]);

  // Reset confetti after 5 seconds
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handlePutCheck = async () => {
    setIsLoading(true);
    try {
      const randomId = generateRandomId();
      const response = await axios.post(`/api/receipts`, {
        'userId': `${Telegram.WebApp.initDataUnsafe.user?.id}`,
        'receiptId': randomId,
        'receiptData': JSON.stringify(receipt),
      });

      console.log('Receipt submission successful:', response.data)
      setShowConfetti(true);
      setJettonBalance(prevBalance => prevBalance + 1000000000);
      await fetchReceipts();
      clearData()
    } catch (error) {
      console.error('Receipt submission failed:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          gravity={0.4}
        />
      )}

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

        {isValid === true && jetton && jettonBalance > 0 ? (
          <Stack gap="xs" mt={24}>
            <Group gap="xs" justify="center">
              <Avatar size="sm" src={jetton.jetton.image} alt={jetton.jetton.symbol}>
                {jetton.jetton.symbol}
              </Avatar>
              <Text size="md" fw={600}>
                Your goals:
              </Text>
            </Group>
            <Text size="lg" fw={500}>
              <NumberFormatter
                suffix={` ${jetton.jetton.symbol}`}
                value={jettonBalance.toString()}
                thousandSeparator
              />
            </Text>
            <Group gap="xs" justify="center" mt={10}>
              <Text size="md" fw={600}>
                Your receipts: {receiptsCount}
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
            {isTonConnected ?
              <ReceiptUploader
                clearReceiptData={isReceiptDataMustCleared}
                isDataParsed={setIsReceiptDataParsed}
                onReceiptData={setReceipt}
                onDataCleared={() => setIsReceiptDataMustCleared(false)}
              /> :
              <Button radius="xl" color="dark" onClick={handleTonClick}>Connect TON Wallet to continue</Button>}
          </>
        )}
      </Stack>

      {connectedAddressString && isReceiptDataParsed && !isLoading && (
        <Stack align="center" mt={20}>
          <Button
            radius="xl"
            variant="filled"
            color="pink"
            onClick={handlePutCheck}
          >
            Get Coins!
          </Button>
        </Stack>
      )}
      {isLoading && (
        <LoadingOverlay visible={isLoading} zIndex={10000} overlayProps={{radius: 'sm', blur: 2}}>
          <Text size="sm" mt="xs">Processing receipt...</Text>
        </LoadingOverlay>
      )}
    </>
  )
}

export default App
