export const WEB_URL = 'https://pnu-blace.vercel.app';
// export const WEB_URL = 'http://localhost:3000';

export const STORAGE_KEYS = {
  PUSH_TOKEN: '@pnublace/pushToken',
  USER_TOKEN: '@pnublace/userToken',
} as const;

export const BRIDGE_INIT_SCRIPT = (platform: string) => `
  (function() {
    window.isNativeApp = true;
    window.nativePlatform = '${platform}';
    
    window.sendToNative = function(type, payload) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
    };
    
    window.sendToNative('REQUEST_PUSH_TOKEN');

    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    
    const originalLog = console.log;
    console.log = function(...args) {
      originalLog.apply(console, args);
    };
    
    true;
  })();
`;
