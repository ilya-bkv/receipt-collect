import { useEffect, useRef, useState } from 'react';
import { Box, PinInput, Progress, Stack, Text } from '@mantine/core';
import { useUserStore } from '../stores/useUserStore';
import { useShallow } from 'zustand/react/shallow';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { apiUrlProxy } from '../utils/apiUrlProxy.ts';

export const SplashScreen = () => {
  const [pin, setPin] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [apiAnswered, setApiAnswered] = useState(false);
  const progressRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate()

  const {updateUser} = useUserStore(
    useShallow((state) => ({
      updateUser: state.updateUser
    }))
  );

  const user = useUserStore(useShallow((state) => ({
    id: state.id,
    nicName: state.nicName ?? 'there'
  })));

  const hasFetchedRef = useRef(false);
  const fetchUser = async (userId: string) => {
    try {
      const resp = await axios.post(`${apiUrlProxy}/login`, {id: userId});
      updateUser({
        goals: resp.data.goals,
        receipts: resp.data.receipts
      });
    } catch (e) {
      console.error('Login request failed:', e);
    } finally {
      setApiAnswered(true);
    }
  };

  useEffect(() => {
    if (!hasFetchedRef.current && user.id) {
      hasFetchedRef.current = true;
      fetchUser(String(user.id))
    }
  }, [user.id]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const cap = apiAnswered ? 100 : 70;
      const diff = Math.random() * 10;
      const newProgress = Math.min(progressRef.current + diff, cap);

      if (newProgress !== progressRef.current) {
        progressRef.current = newProgress;
        setProgress(newProgress);
        if (newProgress >= 100 && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [apiAnswered]);

  const handlePinChange = (value: string) => {
    setPin(value);

    if (value.length === 4) {
      setIsValid(value === import.meta.env.VITE_PIN_CODE);
      navigate('/uploader')
    } else {
      setIsValid(null);
    }
  };

  return (
    <Stack align="center" justify="center">
      <Text size="xl" fw={700} ta="center">
        Welcome to Cheeki App!
      </Text>

      <img src="/logo.png" alt="Logo" style={{width: '100px', margin: '0 auto'}}/>
      {progress !== 100 && (
        <Box w="100%" h="87.8px">
          <Progress color="#3fa9d9" radius="lg" size="md" value={progress} transitionDuration={300}/>
        </Box>
      )}

      {(isValid === null || !isValid) && progress === 100 && (
        <Stack align="center" justify="center">
          <Text size="lg">
            Hello {user.nicName}, enter the PIN
          </Text>
          <PinInput
            mt="1"
            size="md"
            placeholder="?"
            type="number"
            length={4}
            value={pin}
            onChange={handlePinChange}
            error={isValid === false}
          />
        </Stack>
      )}
      {isValid === false && progress === 100 && (
        <Text c="red" ta="center">Invalid PIN. Please try again.</Text>
      )}
    </Stack>
  );
};
