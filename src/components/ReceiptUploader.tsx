import { useState, useRef } from 'react';
import { FileButton, Button, Group, Text, Box, Paper, LoadingOverlay, Table, Title } from '@mantine/core';
import axios from 'axios';

export const ReceiptUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const resetRef = useRef<() => void>(null);

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
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setReceiptData(null);
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
      form.append('extractTime', 'false');
      form.append('refresh', 'false');
      form.append('incognito', 'false');
      form.append('extractLineItems', 'true');

      const response = await axios.post(
        'https://api.taggun.io/api/receipt/v1/simple/file',
        form,
        {
          headers: {
            'accept': 'application/json',
            'apikey': import.meta.env.VITE_API_KEY
          }
        }
      );

      setReceiptData(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to parse receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>

      {!receiptData && (
        <>
          <Title order={4} mt={24}>
            Upload an image of your receipt
          </Title>
          <Group justify="center" mt={24}>
            {file ? (
              <><Button
                color="green"
                onClick={parseReceipt}
                disabled={!file}
              >
                Parse Receipt
              </Button>
                <Button disabled={!file && !error} color="red" onClick={clearFile}>
                  Reset
                </Button></>
            ) : (
              <FileButton resetRef={resetRef} onChange={handleFileChange}>
                {(props) => <Button {...props}>Upload image</Button>}
              </FileButton>
            )}
          </Group>
        </>
      )}

      {error && (
        <Text size="sm" ta="center" mt="sm" c="red">
          {error}
        </Text>
      )}

      {file && (
        <Text size="sm" ta="center" mt="sm" truncate="end" style={{maxWidth: 340}}>
          <span style={{color: 'gray'}}>Picked file:</span> {file.name}
        </Text>
      )}

      {loading && (
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{radius: 'sm', blur: 2}}>
          <Text size="sm" mt="xs">Processing receipt...</Text>
        </LoadingOverlay>

      )}

      {receiptData && !loading && (
        <Paper p="md" mt="md" withBorder>
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
