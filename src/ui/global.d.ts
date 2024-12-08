export {};

declare global {
  interface Window {
    electron: {
      subscribeStatistics: (callback: (statistics: any) => void) => () => void;
      getStaticData: () => void;
    };
  }
}