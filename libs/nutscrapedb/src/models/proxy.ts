export type ProxyCredentials = {
  address: string;
  port: number;
  username?: string;
  password?: string;
  type: 'http' | 'https' | 'socks5';
};
