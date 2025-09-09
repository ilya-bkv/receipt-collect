import { type FC } from 'react';
import { Container, Stack, Title, Text, Paper, Group, Avatar } from '@mantine/core';

export const UserProfile: FC = () => {
  // In a real app, this data would come from a user context or API
  const user = {
    name: 'User Name',
    username: 'username',
    receiptsCount: 0,
    joinDate: new Date().toLocaleDateString()
  };

  return (
    <Container size="sm" py="xl">
      <Paper p="md" radius="md" withBorder>
        <Stack spacing="lg">
          <Group position="center">
            <Avatar size="xl" radius="xl" color="blue">
              {user.name.charAt(0)}
            </Avatar>
          </Group>

          <Title order={2} ta="center">{user.name}</Title>

          <Stack spacing="xs">
            <Group position="apart">
              <Text fw={500}>Username:</Text>
              <Text>{user.username}</Text>
            </Group>

            <Group position="apart">
              <Text fw={500}>Receipts Collected:</Text>
              <Text>{user.receiptsCount}</Text>
            </Group>

            <Group position="apart">
              <Text fw={500}>Member Since:</Text>
              <Text>{user.joinDate}</Text>
            </Group>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};