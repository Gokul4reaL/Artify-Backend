import { Model, Column, Table, ForeignKey, DataType } from 'sequelize-typescript';
import { NFT } from './nfts';
import { Auction } from './auctions';

@Table
export class NFTAuction extends Model<NFTAuction> {
  @ForeignKey(() => NFT)
  @Column({
    allowNull: false,
    type: DataType.UUID
  })
  nft_id!: string;

  @ForeignKey(() => Auction)
  @Column({
    allowNull: false,
    type: DataType.UUID
  })
  auction_id!: string;
}
