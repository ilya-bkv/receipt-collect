import React, { type FC, useState } from 'react';
import { Stack, Title, Container } from '@mantine/core';
import { ReceiptUploader } from '../components/ReceiptUploader';

export const Uploader: FC = () => {
  const [isReceiptDataParsed, setIsReceiptDataParsed] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [isReceiptDataMustCleared, setIsReceiptDataMustCleared] = useState<boolean>(false);

  return (
    <Container size="sm" py="xl">
      <Stack align="center" spacing="lg">
        <Title order={2} ta="center">Receipt Uploader</Title>

        <ReceiptUploader
          clearReceiptData={isReceiptDataMustCleared}
          isDataParsed={setIsReceiptDataParsed}
          onReceiptData={setReceipt}
          onDataCleared={() => setIsReceiptDataMustCleared(false)}
        />
      </Stack>
    </Container>
  );
};
