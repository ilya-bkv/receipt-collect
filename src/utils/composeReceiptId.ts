export type ReceiptIdInput = {
  totalAmount: string;
  date: string;
  merchantName: string;
}

export async function composeReceiptId(input: ReceiptIdInput): Promise<string> {
  const raw = `${input.totalAmount}|${input.date}|${input.merchantName}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // HEX and cut to 16 characters
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}
