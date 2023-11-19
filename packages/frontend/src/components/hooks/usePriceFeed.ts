import PriceControllerABI from '../../abi/PriceController.json';
import { useCallback, useEffect, useState } from 'react';
import { BigNumber, utils } from 'ethers'

export const usePriceFeed = (amountCurrency: string, globalAmount: string) => {
    const [cryptoPrice, setCryptoPrice] = useState<string>()
    const [bigNumberPrice, setBigNumberPrice] = useState<BigNumber>()
    const idForToken: Record<string,number | null> = {
        'avax': 0,
        'usdt': null
    };

    return {cryptoPrice, bigNumberPrice}
};