async function enableMocking() {
  if (process.env.NEXT_PUBLIC_API_MODE === 'live') return;
  if (process.env.NODE_ENV === 'production') return;
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  });
}

void enableMocking();

export {};
