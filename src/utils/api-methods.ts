import axios from "axios";
import { oneInchUrl } from "../config/constants"

interface QuoteDataType{
    srcChain: number,
    dstChain: number,
    srcTokenAddress: string,
    dstTokenAddress: string,
    amount: bigint,
    walletAddress: string,
    enableEstimate: boolean,
}

const apikey = ''

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
        return response.data
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
