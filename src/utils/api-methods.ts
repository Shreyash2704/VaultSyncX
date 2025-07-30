import axios from "axios";
import { oneInchUrl } from "../config/constants"
import type { BuildOrderParams } from "../types/types";

interface QuoteDataType{
    srcChain: number,
    dstChain: number,
    srcTokenAddress: string,
    dstTokenAddress: string,
    amount: bigint,
    walletAddress: string,
    enableEstimate: boolean,
}

export const apikey = import.meta.env.VITE_API_KEY;

export const getQuote = async(paramsData:QuoteDataType) =>{
   const url = "/api/fusion-plus/quoter/v1.0/quote/receive";
    const config = {
        headers: {
          Authorization: `Bearer ${apikey}`,
        },
        params: paramsData,
        paramsSerializer: {
          indexes: null,
        },
      };
  

      try {
        const response = await axios.get(url, config);
        console.log(response.data);
        return {
            status: "success",
            data:response.data
          }
      } catch (error) {
        console.error(error);
        if(axios.isAxiosError(error)) {
          console.error("Axios error:", error.response?.data);
          return {
            status: "error",
            data:error.response?.data
          }
        }
      }
}

export const getQuoteData = async(param:any,data:any) =>{
   const url = "/api/fusion-plus/quoter/v1.0/quote/receive";

  const config = {
    headers: {
      Authorization: `Bearer ${apikey}`,
    },
    params: param,
    paramsSerializer: {
      indexes: null,
    },
  };
  const body = data

  try {
    const response = await axios.post(url, body, config);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

export const getTokenPrice = async(token:string) =>{
   const url = "/api/price/v1.1/1";

    const config = {
      headers: {
        Authorization: `Bearer ${apikey}`,
      },
      params: {},
      paramsSerializer: {
        indexes: null,
      },
    };
    const body = {
      tokens: [token],
      currency: "USD",
    };
  
    try {
      const response = await axios.post(url, body, config);
      console.log(response.data);
      return response.data
    } catch (error) {
      console.error(error);
    }
}

export const getSupportedChains = async() =>{
  const url = "/api/portfolio/portfolio/v5.0/general/supported_chains"

  const config = {
    headers: {
      Authorization: `Bearer ${apikey}`,
    },
    params: {},
    paramsSerializer: {
      indexes: null,
    },
  };

  try {
    const response = await axios.get(url, config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export const getPortfolio = async(address:string | undefined,chain:number | undefined) =>{
  if(!address || !chain) return;
  const url = "/api/portfolio/portfolio/v5.0/general/current_value";

  const config = {
    headers: {
      Authorization: `Bearer ${apikey}`,
    },
    params: {
      chain_id: chain,
      addresses: [address],
    },
    paramsSerializer: {
      indexes: null,
    },
  };

  try {
    const response = await axios.get(url, config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }

}

export const getBalance = async(address:string, chainId:number) =>{
  const url = `/api/balance/v1.2/${chainId}/balances/${address}`

  const config = {
    headers: {
      Authorization: `Bearer ${apikey}`,
    },
    params: {},
    paramsSerializer: {
      indexes: null,
    },
  };

  try {
    const response = await axios.get(url, config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export const getGasPrice = async(chainId:number) =>{
  const url = `/gas-price/v1.6/${chainId}`
   const config = {
    headers: {
      Authorization: `Bearer ${apikey}`,
    },
    params: {},
    paramsSerializer: {
      indexes: null,
    },
  };

  try {
    const response = await axios.get(url, config);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

export const getWhiteListedTokens = async(chainId:number) =>{
  const url = `/api/token/v1.2/${chainId}/`
  const config = {
    headers: {
      Authorization: `Bearer ${apikey}`,
    },
    params: {
      provider: "1inch",
      country: "US",
    },
    paramsSerializer: {
      indexes: null,
    },
  };

  try {
    const response = await axios.get(url, config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export const getToken = async(chainId:number, tokenAddress:string) =>{
  const url = `https://api.1inch.dev/token/v1.2/${chainId}/custom/${tokenAddress}`
   const config = {
    headers: {
      Authorization: `Bearer ${apikey}`,
    },
    params: {},
    paramsSerializer: {
      indexes: null,
    },
  };

  try {
    const response = await axios.get(url, config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export const buildOrderByQuote = async(quote:any,params:BuildOrderParams,secretHashList:any[]) =>{
   const url = "/api/fusion-plus/quoter/v1.0/quote/build";

  const config = {
    headers: {
      Authorization: `Bearer ${apikey}`,
    },
    params: {
      srcChain: params.srcChain,
      dstChain: params.dstChain,
      srcTokenAddress: params.srcTokenAddress,
      dstTokenAddress: params.dstTokenAddress,
      amount: params.amount,
      walletAddress: params.walletAddress,
    },
    paramsSerializer: {
      indexes: null,
    },
  };
  const body = {
    quote: quote,
    secretsHashList:secretHashList
  }

  try {
    const response = await axios.post(url, body, config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export const submitOrder = async(Order:any,params:BuildOrderParams,secretHashList:`0x${string}`[] | undefined,signature:string,extension:string,quoteId:string) =>{
  const url = "/api/fusion-plus/relayer/v1.0/submit";

  const config = {
    headers: {
      Authorization: `Bearer ${apikey}`,
    },
    params: {},
    paramsSerializer: {
      indexes: null,
    },
  };
  const body = {
    order: Order,
    srcChainId: Number(params.srcChain),
    signature: signature,
    extension: extension,
    quoteId: quoteId,
    secretHashes: secretHashList,
  };

  try {
    const response = await axios.post(url, body, config);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

export const submitOrderSecret = async(secret:string, orderHash:string) =>{
    const url = "https://api.1inch.dev/fusion-plus/relayer/v1.0/submit/secret";

    const config = {
      headers: {
        Authorization: `Bearer ${apikey}`,
      },
      params: {},
      paramsSerializer: {
        indexes: null,
      },
    };
    const body = {
      secret: secret,
      orderHash: orderHash,
    };

    try {
      const response = await axios.post(url, body, config);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
}

export const getSupportedTokens = async (chainId: number) => {
  const url = `/api/token/v1.2/${chainId}`;
  
   const config = {
    headers: {
      Authorization: `Bearer ${apikey}`,
    },
    params: {
      provider: "1inch",
      country: "US",
    },
    paramsSerializer: {
      indexes: null,
    },
  };

  try {
    const response = await axios.get(url, config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getTokenChart = async (chainId: number, token0: string, token1: string, period: string = '24H') => {
  const url = `/api/charts/v1.0/chart/line/${token0}/${token1}/${period}/${chainId}`;
   const config = {
    headers: {
      Authorization: `Bearer ${apikey}`,
    },
    params: {},
    paramsSerializer: {
      indexes: null,
    },
  };

  try {
    const response = await axios.get(url, config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getTokenCandleChart = async (chainId: number, tokenAddress: string, period: string = '24H') => {
  const url = `/api/charts/v1.0/${chainId}/chart/${tokenAddress}/candle`;
  
  const config = {
    headers: {
      Authorization: `Bearer ${apikey}`,
    },
    params: { period }
  };

  try {
    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching candle chart:', error);
    throw error;
  }
};

