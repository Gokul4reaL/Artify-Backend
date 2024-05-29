import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // Specify the URL of your Ganache instance
      chainId: 1337, // Specify the chain ID of your Ganache instance (typically 1337)
    },
  },
};

export default config;
