import Web3 from 'web3';

export interface IEthereumWindow extends Window {
  ethereum: {
    enable: () => Promise<boolean>;
  };
  web3: Web3;
}
