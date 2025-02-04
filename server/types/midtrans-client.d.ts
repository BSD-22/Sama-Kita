declare module 'midtrans-client' {
  export class Snap {
    constructor(options: { isProduction: boolean; serverKey: string; clientKey: string });
    createTransaction(parameters: object): Promise<{ token: string; redirect_url: string }>;
    createTransactionToken(parameters: object): Promise<string>;
    createTransactionRedirectUrl(parameters: object): Promise<string>;
  }

  export class CoreApi {
    constructor(options: { isProduction: boolean; serverKey: string; clientKey: string });
    charge(parameters: object): Promise<any>;
    capture(parameters: object): Promise<any>;
    transaction(parameter: object): Promise<any>;
  }

  export class Iris {
    constructor(options: { serverKey: string });
    createPayout(parameters: object): Promise<any>;
    approvePayouts(parameters: object): Promise<any>;
    rejectPayouts(parameters: object): Promise<any>;
  }
}
