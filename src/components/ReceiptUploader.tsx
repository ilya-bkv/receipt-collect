import { useState, useRef, useEffect } from 'react';
import {
  FileButton,
  Button,
  Group,
  Text,
  Box,
  Paper,
  LoadingOverlay,
  Table,
  Title,
  CloseButton,
  Card,
  Image, Stack
} from '@mantine/core';
import axios from 'axios';

export type ReceiptUploaderRef = {
  clearReceiptData: () => void;
};

type Props = {
  onReceiptData?: (data: any) => void;
  clearReceiptData: boolean;
  onDataCleared?: () => void;
}

export const ReceiptUploader = (props: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const resetRef = useRef<() => void>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (props.clearReceiptData) {
      setFile(null);
      setReceiptData(null);
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
    setReceiptData(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    resetRef.current?.();
  };

  const parseReceipt = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setReceiptData(null);

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

      // Extract the response data including the id
      const responseData = {
        ...response.data,
        id: response.data.id || response.data._id || null // Ensure id is included in the response data
      };

      setReceiptData(responseData);
      props.onReceiptData?.(responseData);
    } catch (err) {
      console.error(err);
      setError('Failed to parse receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Group justify="center" mt={24}>

        {file ? (
          <Stack>
            <Title order={2} ta="center">Looks good!</Title>
            <Button
              radius="xl"
              size="compact-lg"
              color="green"
              onClick={parseReceipt}
              disabled={!file}
              variant="gradient"
              gradient={{from: 'blue', to: 'green', deg: 90}}
            >
              Tap to earn points!
            </Button>
          </Stack>
        ) : (
          <>
            <Title order={2} ta="center">Receipt Uploader</Title>
            <FileButton resetRef={resetRef} onChange={handleFileChange}>
              {(props) => <Button
                variant="gradient"
                size="compact-lg"
                gradient={{from: 'blue', to: 'green', deg: 90}} radius="xl" {...props}>
                Select Receipt Image
              </Button>}
            </FileButton>
          </>
        )}
      </Group>


      {error && (
        <Text size="sm" ta="center" mt="sm" c="red">
          {error}
        </Text>
      )}

      {previewUrl && !loading && !receiptData && file && (
        <Card withBorder shadow="sm" mt="18" radius="md" padding="0">
          <CloseButton
            style={{position: 'absolute', top: 0, right: 0}}
            aria-label="Cancel" onClick={clearFile}
            size="lg"
          />
          <Image src={previewUrl}/>
        </Card>
      )}

      {loading && (
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{radius: 'sm', blur: 2}}>
          <Text size="sm" mt="xs">Processing receipt...</Text>
        </LoadingOverlay>

      )}

      {receiptData && !loading && (
        <Paper p="xs" mt="md" withBorder>
          <Text size="md" fw={500} mb="xs">Receipt Data:</Text>
          <Box style={{maxHeight: '300px', overflow: 'auto'}}>
            <Table withColumnBorders withTableBorder striped>
              {Object.entries(receiptData).map(([key, value]) => (
                <Table.Tr key={key}>
                  <Table.Td><b>{key}</b></Table.Td>
                  <Table.Td>
                    {typeof value === 'object' && value !== null
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table>
          </Box>
        </Paper>
      )}
    </div>
  )
}
