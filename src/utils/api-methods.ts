import axios from "axios";
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
const baseUrl = window.location.origin.includes("localhost") ? "/api" : "https://api.1inch.dev";

// Add this utility function to your api-methods.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: 'success' | 'error' | 'no_response';
}

export const handleApiResponse = async <T>(
  apiCall: () => Promise<T>,
  timeoutMs: number = 30000
): Promise<ApiResponse<T>> => {
  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('API_TIMEOUT')), timeoutMs);
    });

    // Race between API call and timeout
    const result = await Promise.race([apiCall(), timeoutPromise]);

    // Check if result is valid
    if (result === null || result === undefined) {
      return {
        success: false,
        status: 'no_response',
        error: 'No response from server'
      };
    }

    return {
      success: true,
      status: 'success',
      data: result
    };

  } catch (error: any) {
    // Handle different types of errors
    if (error.message === 'API_TIMEOUT') {
      return {
        success: false,
        status: 'no_response',
        error: 'Request timed out'
      };
    }

    // Handle Axios errors
    if (error.response) {
      return {
        success: false,
        status: 'error',
        error: error.response.data?.description || error.response.data?.message || 'API Error'
      };
    }

    // Handle network errors
    if (error.request) {
      return {
        success: false,
        status: 'no_response',
        error: 'Network error - no response received'
      };
    }

    // Handle other errors
    return {
      success: false,
      status: 'error',
      error: error.message || 'Unknown error occurred'
    };
  }
};

export const getQuote = async(paramsData:QuoteDataType) =>{
   const url = `${baseUrl}/fusion-plus/quoter/v1.0/quote/receive`;
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
   const url = `${baseUrl}/fusion-plus/quoter/v1.0/quote/receive`;

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
   const url = `${baseUrl}/price/v1.1/1`;

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
  const url = `${baseUrl}/portfolio/portfolio/v5.0/general/supported_chains`

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
  const url = `${baseUrl}/portfolio/portfolio/v5.0/general/current_value`;

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
  const url = `${baseUrl}/balance/v1.2/${chainId}/balances/${address}`

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
  const url = `${baseUrl}/token/v1.2/${chainId}/`
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


export const buildOrderByQuote = async(quote:any,params:BuildOrderParams,secretHashList:any[]) =>{
   const url = `${baseUrl}/fusion-plus/quoter/v1.0/quote/build`;

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
  
  const apiCall = async() =>{
    const url = `${baseUrl}/fusion-plus/relayer/v1.0/submit`;

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

   const response = await axios.post(url, body, config);
    return response.data;
  }
  
   return handleApiResponse(apiCall, 30000);
}

export const submitOrderSecret = async(secret:string, orderHash:string) =>{
    const url = `${baseUrl}/fusion-plus/relayer/v1.0/submit/secret`;

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
  const url = `${baseUrl}/token/v1.2/${chainId}`;
  
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
  const url = `${baseUrl}/charts/v1.0/chart/line/${token0}/${token1}/${period}/${chainId}`;
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
  const url = `${baseUrl}/charts/v1.0/${chainId}/chart/${tokenAddress}/candle`;
  
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

export const getContractAddress = async(chainId:number) =>{
    const url = `${baseUrl}/fusion-plus/orders/v1.0/order/escrow`;

  const config = {
    headers: {
      Authorization: `Bearer ${apikey}`,
    },
    params: {
      chainId: chainId.toString(),
    },
    paramsSerializer: {
      indexes: null,
    },
  };

  try {
    const response = await axios.get(url, config);
    console.log(response.data);
    return response.data.address;
  } catch (error) {
    console.error(error);
  }
}

export async function checkOrderConfirmed(orderHash: string) {
  const url = `${baseUrl}/fusion-plus/orders/v1.0/order/ready-to-accept-secret-fills/${orderHash}`;

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

