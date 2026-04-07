const PIN_KEY = 'gamingtask_lock_pin';

export async function savePin(pin: string): Promise<void> {
  localStorage.setItem(PIN_KEY, pin);
}

export async function getPin(): Promise<string | null> {
  return localStorage.getItem(PIN_KEY);
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
  localStorage.removeItem(PIN_KEY);
}
