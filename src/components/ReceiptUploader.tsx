import { useEffect, useRef, useState } from 'react';
import { Button, Card, CloseButton, FileButton, Group, Image, LoadingOverlay, Stack, Text, Title } from '@mantine/core';
import axios from 'axios';
import { apiUrlProxy } from '../utils/apiUrlProxy.ts';
import { useUserStore } from '../stores/useUserStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { useNavigate } from 'react-router';
import { composeReceiptId } from '../utils/composeReceiptId.ts';
import { RingLoader } from './RingLoader.tsx';

export type ReceiptUploaderRef = {
  clearReceiptData: () => void;
};

type Props = {
  clearReceiptData: boolean;
  onDataCleared?: () => void;
}

export const ReceiptUploader = (props: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const resetRef = useRef<() => void>(null);
  const navigate = useNavigate();
  const user = useUserStore(useShallow((state) => ({
    id: state.id,
    goals: state.goals,
    receipts: state.receipts
  })));

  useEffect(() => {
    if (props.clearReceiptData) {
      setFile(null);

      setError(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      resetRef.current?.();
      props.onDataCleared?.();
    }
  }, [props.clearReceiptData])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
  const ACCEPTED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/heic'
  ];

  const handleFileChange = (selectedFile: File | null) => {
    setError(null);

    if (!selectedFile) {
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 20MB limit. Current size: ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    // Check type
    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type) &&
      !selectedFile.name.toLowerCase().endsWith('.heic')) {
      setError(`Invalid file type. Accepted types: PDF, JPG, PNG, GIF, HEIC`);
      return;
    }

    setFile(selectedFile);

    // Create preview only for browser-renderable images (skip HEIC)
    if (selectedFile.type.startsWith('image/') && selectedFile.type !== 'image/heic') {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    resetRef.current?.();
  };

  const parseReceipt = async () => {
    if (!file) {
      setError('Please select a file first');
      return
    }

    setError(null);


    const form = new FormData();
    form.append('file', file);
    form.append('extractTime', 'true');
    form.append('refresh', 'false');
    form.append('incognito', 'false');
    form.append('extractLineItems', 'true');

    const response = await axios.post(
      'https://api.taggun.io/api/receipt/v1/verbose/file',
      form,
      {
        headers: {
          'accept': 'application/json',
          'apikey': import.meta.env.VITE_API_KEY
        }
      }
    );

    // Check is really receipt
    if (!response.data.totalAmount.data || !response.data.date.data) {
      setError('Your image doesn’t really look like a receipt. Please try taking a new photo or upload a different image.')
      return
    }
    const receiptId = await composeReceiptId({
      totalAmount: response.data.totalAmount.data,
      date: response.data.date.data,
      merchantName: response.data.merchantName.data
    });

    const data = {
      ...response.data,
      id: receiptId
    } as const;

    try {
      await axios.post(`${apiUrlProxy}/receipts`, {
        userId: user.id,
        receiptData: data
      });
    } catch (err) {
      // Surface backend error to UI and stop flow
      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;

        if (status === 409) {
          setError('Receipt already exists');
          return;
        }
      }

      setError('Network error while saving receipt');
      return;
    }

    return data;
  };

  const updateUserEntity = async (receiptId: string) => {

    // Update user in database
    const updateUserDb = await axios.post(`${apiUrlProxy}/credit-user`, {
      userId: user.id,
      goals: user.goals + 10,
      receiptId: receiptId
    });

    // Update user in local store
    const {addReceipt, addGoals} = useUserStore.getState();
    addGoals(10);
    addReceipt(receiptId);
    console.log('%c!!! UPDATE USER:', 'color: #bada55', updateUserDb.data);
  }

  const processingReceipt = async () => {
    setIsLoading(true);
    try {
      // Step 1: Parsing receipt
      setLoadingMessage('Processing receipt...')
      const parsedReceiptData = await parseReceipt();

      if (!parsedReceiptData) {
        return;
      }

      setLoadingMessage('👤 User data update');
      await updateUserEntity(parsedReceiptData.id);
      setLoadingMessage('✅ User data updated');

      setLoadingMessage('🎉 All steps are successful! We go to the profile');
      navigate('/profile');

    } catch (error) {
      console.error('❌ Error when processing a receipt:', error);
      // setError('There was an error when processing a receipt');
      setError(JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div>
      <Group justify="center" mt={24}>
        {file ? (
          <Stack>
            <Title order={2} ta="center">{error ? 'Oops 😬' : 'Almost done!'}</Title>
            {!error && (
              <Button
                radius="xl"
                size="lg"
                color="green"
                onClick={processingReceipt}
                disabled={!file}
                variant="gradient"
                gradient={{from: 'blue', to: 'green', deg: 90}}
              >
                Tap to earn points!
              </Button>
            )}
          </Stack>
        ) : (
          <>
            <Title order={2} ta="center">Receipt Uploader</Title>
            <FileButton resetRef={resetRef} onChange={handleFileChange}>
              {(props) => <Button
                variant="gradient"
                size="lg"
                gradient={{from: 'blue', to: 'green', deg: 90}} radius="xl" {...props}>
                Select Receipt Image
              </Button>}
            </FileButton>
          </>
        )}
      </Group>


      {error && (
        <Text size="sm" ta="center" mt="sm" fw="400" c="red">
          {error}
        </Text>
      )}

      {previewUrl && !isLoading && file && (
        <div style={{position: 'relative'}}>
          <CloseButton
            style={{
              position: 'absolute',
              zIndex: 9999,
              top: '-14px',
              right: '-8px',
              background: 'var(--mantine-color-body)',
              border: '1px solid #ccc',
              borderRadius: '100%',
              cursor: 'pointer'
            }}
            aria-label="Cancel"
            onClick={clearFile}
            size="lg"
            disabled={isLoading}

          />
          <Card withBorder shadow="sm" mt="18" radius="md" padding="0">
            <Image src={previewUrl}/>
          </Card>
        </div>
      )}


      <LoadingOverlay
        visible={isLoading}
        loaderProps={{
          children:
            <Stack justify="center" align="center">
              <RingLoader/>
              <Text size="md" ta="center" fw="500">{loadingMessage}</Text>
            </Stack>
        }}
        zIndex={1000}
        overlayProps={{radius: 'sm', blur: 4}}
      />


      {/*{receiptData && !loading && (*/}
      {/*  <Paper p="xs" mt="md" withBorder>*/}
      {/*    <Text size="md" fw={500} mb="xs">Receipt Data:</Text>*/}
      {/*    <Box style={{maxHeight: '300px', overflow: 'auto'}}>*/}
      {/*      <Table withColumnBorders withTableBorder striped>*/}
      {/*        {Object.entries(receiptData).map(([key, value]) => (*/}
      {/*          <Table.Tr key={key}>*/}
      {/*            <Table.Td><b>{key}</b></Table.Td>*/}
      {/*            <Table.Td>*/}
      {/*              {typeof value === 'object' && value !== null*/}
      {/*                ? JSON.stringify(value, null, 2)*/}
      {/*                : String(value)}*/}
      {/*            </Table.Td>*/}
      {/*          </Table.Tr>*/}
      {/*        ))}*/}
      {/*      </Table>*/}
      {/*    </Box>*/}
      {/*  </Paper>*/}
      {/*)}*/}
    </div>
  )
}
