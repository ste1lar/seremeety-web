declare module 'bootpay-js' {
  export interface BootPayChain {
    error(callback: (data: Record<string, unknown>) => void): BootPayChain;
    cancel(callback: (data: Record<string, unknown>) => void): BootPayChain;
    ready(callback: (data: Record<string, unknown>) => void): BootPayChain;
    confirm(callback: (data: Record<string, unknown>) => void): BootPayChain;
    close(callback: (data: Record<string, unknown>) => void): BootPayChain;
    done(callback: (data: Record<string, unknown>) => void): BootPayChain;
  }

  export interface BootPayInstance {
    request(payload: Record<string, unknown>): BootPayChain;
    transactionConfirm(data: Record<string, unknown>): void;
    removePaymentWindow(): void;
  }

  const BootPay: BootPayInstance;
  export default BootPay;
}
