import { useState, type FC } from 'react';
import {
  Container,
  Stack,
  Text,
  Paper,
  Group,
  Avatar,
  Divider,
  Button,
  Blockquote,
  Modal
} from '@mantine/core';
import useTelegramBackButton from '../hooks/useBackButton.tsx';
import { useUserStore } from '../stores/useUserStore.ts';
import { useShallow } from 'zustand/react/shallow';
import axios from 'axios';
import { apiUrlProxy } from '../utils/apiUrlProxy.ts';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { shortenAddress } from '../utils/shortenAddress.ts';
import { useDisclosure } from '@mantine/hooks';


export const UserProfile: FC = () => {
    const [count, setCount] = useState(0);
    const [tonConnectUI] = useTonConnectUI();
    const userFriendlyAddress = useTonAddress();
    const [opened, {open, close}] = useDisclosure(false);

    const user = useUserStore(useShallow((state) => ({
      id: state.id,
      nicName: state.nicName,
      avatar: state.avatar,
      goals: state.goals,
      receipts: state.receipts
    })));

    useTelegramBackButton('/uploader');


    const getUserReceipts = async () => {
      try {
        const response = await axios.get(
          `${apiUrlProxy}/user/${user.id}`
        );
        console.log('😊😊😊😊 User receipts:', response.data);
      } catch (err: any) {
        console.error('😊😊😊 Error fetching receipts:', err.response?.data || err.message);
        throw err;
      }
    };
    const resetUserReceipts = async () => {
      try {
        const response = await axios.post(
          `${apiUrlProxy}/debug/reset-user/`, {userId: user.id}
        );
        console.log('😊😊😊😊 resetUserReceipts:', response.data);
      } catch (err: any) {
        console.error('😊😊😊 resetUserReceipts:', err.response?.data || err.message);
        throw err;
      }
    };
    const resetAllReceipts = async () => {
      try {
        const response = await axios.post(
          `${apiUrlProxy}/debug/receipts/clear/`);
        console.log('😊😊😊😊 resetAllReceipts:', response.data);
      } catch (err: any) {
        console.error('😊😊😊 resetAllReceipts:', err.response?.data || err.message);
        throw err;
      }
    };

    const handleDisconnect = async () => {
      try {
        await tonConnectUI.disconnect();
      } catch (error) {
        console.error('Ton disconnect error:', error);
      }
    };

    const claimRewards = async () => {
      if (!tonConnectUI.connected) {
        try {
          await tonConnectUI.openModal();
        } catch (error) {
          console.error('Ton connect error:', error);
        }
      }

      if (tonConnectUI.connected) {
        open();
        return;
      }
    }

    return (
      <Container size="sm" py="xl" style={{minWidth: '100vw'}}>
        <img src="/logo.png" alt="Logo" style={{width: '100px', margin: '20px auto'}}/>
        <Paper shadow="sm" radius="md" withBorder p="md">
          <Stack>
            <Group>
              <Avatar
                variant="outline"
                radius="xl"
                size="lg"
                color="blue"
                src={user.avatar}
                onClick={() => setCount(prevState => prevState + 1)}
              />
              <Text
                size="xl"
                fw={900}
                variant="gradient"
                gradient={{from: 'blue', to: 'green', deg: 90}}
              >{user.nicName}</Text>
            </Group>
            <Divider/>
            <Stack>
              <Group>
                <Text>User ID:</Text>
                <Text fw={600}>{user.id}</Text>
              </Group>
              <Group>
                <Text>Receipts Collected:</Text>
                <Text fw={600}>{user?.receipts?.length}</Text>
              </Group>
              <Group>
                <Text>Earned points:</Text>
                <Text fw={600}>{user.goals || 0}</Text>
              </Group>
              {tonConnectUI.connected && (
                <Group>
                  <Text>TON Wallet:</Text>
                  <Text fw={600}>{shortenAddress(userFriendlyAddress)}</Text>
                  <Button
                    onClick={handleDisconnect}
                    size="xs" radius="xl" variant="outline"
                  >
                    Disconnect
                  </Button>
                </Group>
              )}
              <Group>
                <Button
                  variant="gradient"
                  size="md"
                  fullWidth
                  gradient={{from: 'blue', to: 'green', deg: 90}} radius="xl"
                  onClick={claimRewards}
                >
                  Claim rewards
                </Button>
              </Group>
            </Stack>
          </Stack>
        </Paper>
        {count === 5 && (

          <Blockquote color="red" cite="DANGER ZONE" mt="xl">
            <Stack my="14">
              <Button
                size="md"
                color="blue"
                variant="outline"
                onClick={getUserReceipts}
              >
                Get User Info
              </Button>
              <Button
                size="md"
                color="red"
                onClick={resetUserReceipts}
              >
                Reset user
              </Button>
              <Button
                size="md"
                color="red"
                onClick={resetAllReceipts}
              >
                Reset all receipts
              </Button>
            </Stack>
          </Blockquote>
        )}
        <Modal
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3
          }}
          opened={opened}
          radius="lg"
          onClose={close}
          yOffset="1vh"
          centered
          title={user.goals >= 1000 ? '📣 Coming soon!': '🎉 Unlock Your Rewards!'}
        >
          {user.goals >= 1000 ?
            <Text>
              Withdraw to crypto coming soon — get ready to cash out in the most convenient way!
            </Text>
            :
            <Text>You can cash out your points once you reach <b>1,000</b>. Keep going — every purchase brings you closer to your
              reward!</Text>
          }
        </Modal>
      </Container>
    );
  }
;
