import { Sequelize } from 'sequelize-typescript';
import { User } from './model/users';
import { UserProfile } from './model/users_profile';
import { NFT } from './model/nfts';
import { Auction } from './model/auctions';
import { NFTAuction } from './model/nft_auctions';

// Create Sequelize instance
export const sequelize = new Sequelize({
  database: 'artify',
  username: 'root',
  password: 'root',
  host: 'localhost',
  dialect: 'mysql', // or your database dialect
});

// Add models to Sequelize
sequelize.addModels([User, UserProfile, NFT, Auction, NFTAuction]);

