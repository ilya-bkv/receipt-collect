export const  shortenAddress = (address: string, startLen = 6, endLen = 3): string => {
  if (address.length <= startLen + endLen + 3) return address;
  return `${address.slice(0, startLen)}…${address.slice(-endLen)}`;
}
