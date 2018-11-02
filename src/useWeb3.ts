import { useEffect, useState } from 'react';
import Web3 from 'web3';
import { IEthereumWindow } from '../window-ethereum';

export interface IuseWeb3Payload {
  isLoggedIn: boolean;
  loggedInAddress: string;
  desiredNetworkID: number;
}

export interface IuseWeb3State extends IuseWeb3Payload {
  hasWeb3?: boolean;
  isLocked?: boolean;
  loggedInAddressDifferent?: boolean;
  web3Address?: boolean;
  networkDifferent?: boolean;
}

export default (payload: IuseWeb3Payload): IuseWeb3State => {
  const [state, setState] = useState<IuseWeb3State>(payload);

  window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if ((window as IEthereumWindow).ethereum) {
      try {
        // Request account access if needed
        await (window as IEthereumWindow).ethereum.enable();
        const web3 = new Web3((window as any).ethereum);
        // Acccounts now exposed
        useEffect(
          () => {
            const web3IntervalId = setInterval(async () => {
              const isLocked = !(web3.eth.accounts.wallet as any).length;
              const currentNetwork = await web3.eth.net.getId;
              const networkDifferent =
                typeof currentNetwork === 'number' &&
                currentNetwork === payload.desiredNetworkID;

              if (isLocked) {
                setState({
                  ...state,
                  hasWeb3: true,
                  isLocked,
                  networkDifferent,
                });
              } else {
                const web3Address = (web3.eth.accounts.wallet as any)[0]
                  .address;

                setState({
                  ...state,
                  hasWeb3: true,
                  isLocked: false,
                  loggedInAddressDifferent:
                    payload.loggedInAddress === web3Address,
                  networkDifferent,
                  web3Address,
                });
              }
            }, 1000);
            return () => clearInterval(web3IntervalId);
          },
          [state, payload]
        );
      } catch (error) {
        // User denied account access...
        // console.error('User declined access to web3 provider');
        throw new Error('User rejected web3 access');
      }
    }
    // Legacy dapp browsers...
    else if ((window as IEthereumWindow).web3) {
      const web3 = new Web3((window as IEthereumWindow).web3.currentProvider);
      const web3Address = (web3.eth.accounts.wallet as any)[0].address;
      const currentNetwork = await web3.eth.net.getId;
      const networkDifferent =
        typeof currentNetwork === 'number' &&
        currentNetwork === payload.desiredNetworkID;
      // Acccounts always exposed

      useEffect(
        () => {
          const web3IntervalId = setInterval(() => {
            setState({
              ...state,
              hasWeb3: true,
              isLocked: false,
              loggedInAddressDifferent: payload.loggedInAddress === web3Address,
              networkDifferent,
              web3Address,
            });
          });
          return () => clearInterval(web3IntervalId);
        },
        [state, payload]
      );
    }
    // Non-dapp browsers...
    else {
      setState({
        ...state,
        hasWeb3: false,
      });
    }
  });
  return state;
};
