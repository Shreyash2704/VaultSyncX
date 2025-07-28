import { makeAutoObservable } from "mobx";

class NetworkStore {
  allChains: any[] = [];
  chainId: number | null = null;
  chainName: string = "";
  isConnected: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setAllChains(chains: any[]) {
    this.allChains = chains;
  }
  setChainId(id: number) {
    this.chainId = id;
  }

  setChainName(name: string) {
    this.chainName = name;
  }

  setIsConnected(status: boolean) {
    this.isConnected = status;
  }
}

export const networkStore = new NetworkStore();