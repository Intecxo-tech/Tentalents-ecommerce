// ✅ apps/frontend/firebase/authService.ts
export const sendTokenToBackend = async (idToken: string) => {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: idToken }),
    });

    if (!res.ok) {
      throw new Error('Failed to send token to backend');
    }

    const data = await res.json();
    console.log('Token sent successfully:', data);
  } catch (err) {
    console.error('Error sending token to backend:', err);
  }
};
