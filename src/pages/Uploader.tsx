import { type FC, useState } from 'react';
import { Stack, Container, Text, Avatar, Badge } from '@mantine/core';
import { ReceiptUploader } from '../components/ReceiptUploader';
import { useUserStore } from '../stores/useUserStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { Link } from 'react-router';

export const Uploader: FC = () => {
  const [isReceiptDataMustCleared, setIsReceiptDataMustCleared] = useState<boolean>(false);
  const user = useUserStore(useShallow((state) => ({
    id: state.id,
    avatar: state.avatar,
    nicName: state.nicName ?? 'there',
    goals: state.goals,
    receipts: state.receipts
  })));
  return (
    <>
      <Stack justify="space-between" p="12"
             style={{
               boxShadow: '0 2px 2px rgba(0,0,0,0.2)',
               position: 'fixed',
               top: 0,
               left: 0,
               width: '100%',
               flexDirection: 'row',
               background: 'var(--mantine-color-body)',
             }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Avatar src="/logo.png" variant="filled" radius="xl" size="sm" color="indigo"/>
          <Text size="sm" fw="bold">Cheeki App</Text>
        </div>

        <Badge
          size="lgh"
          variant="gradient"
          gradient={{from: 'blue', to: 'green', deg: 117}}
          leftSection={<Avatar src={user.avatar} variant="filled" radius="xl" size="sm" color="indigo"/>}
          component={Link}
          to="/profile"
          p="3 8 3 3"
          style={{cursor: 'pointer'}}
          autoContrast
        >
          <Text size="xs" style={{textTransform: 'none'}} fw="bold">{user.nicName}</Text>
        </Badge>
      </Stack>

      <Container size="lg" py="xl" mt="42">
        <Stack align="center">
          <ReceiptUploader
            clearReceiptData={isReceiptDataMustCleared}
            onDataCleared={() => setIsReceiptDataMustCleared(false)}
          />
        </Stack>
      </Container>
    </>
  )
    ;
};
