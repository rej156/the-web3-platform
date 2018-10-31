import { useEffect, useState } from 'react';
import Web3 from 'web3';
import { IEthereumWindow } from '../window-ethereum';

interface IuseWeb3Payload {
  hasWeb3?: boolean;
  isLocked?: boolean;
  isLoggedIn: boolean;
  loggedInAddressDifferent?: boolean;
  loggedInAddress: string;
  web3Address?: boolean;
}

export default (payload: IuseWeb3Payload) => {
  const [state, setState] = useState(payload);

  window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if ((window as IEthereumWindow).ethereum) {
      try {
        // Request account access if needed
        await (window as IEthereumWindow).ethereum.enable();
        const web3 = new Web3((window as any).ethereum);
        // Acccounts now exposed
        const web3IntervalId = useEffect(
          () => {
            const isLocked = !(web3.eth.accounts.wallet as any).length;

            if (isLocked) {
              setState({
                ...state,
                hasWeb3: true,
                isLocked,
              });
            } else {
              const web3Address = (web3.eth.accounts.wallet as any)[0].address;

              setState({
                ...state,
                hasWeb3: true,
                isLocked: false,
                loggedInAddressDifferent:
                  payload.loggedInAddress === web3Address,
                web3Address,
              });
            }
          },
          [state, payload]
        );
      } catch (error) {
        // User denied account access...
        // console.error('User declined access to web3 provider');
        setState({
          ...state,
          hasWeb3: false,
        });
      }
    }
    // Legacy dapp browsers...
    else if ((window as IEthereumWindow).web3) {
      const web3 = new Web3((window as IEthereumWindow).web3.currentProvider);
      // Acccounts always exposed
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
