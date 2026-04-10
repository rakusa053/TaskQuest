import * as SecureStore from 'expo-secure-store';

const PIN_KEY = 'taskqest_lock_pin';

export async function savePin(pin: string): Promise<void> {
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

export async function getPin(): Promise<string | null> {
  return SecureStore.getItemAsync(PIN_KEY);
}

export async function verifyPin(input: string): Promise<boolean> {
  const stored = await getPin();
  return stored === input;
}

export async function hasPin(): Promise<boolean> {
  const pin = await getPin();
  return pin !== null && pin.length === 4;
}

export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_KEY);
}
