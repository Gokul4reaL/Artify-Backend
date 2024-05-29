import { Model, Column, Table, PrimaryKey, DataType, BelongsTo, ForeignKey, BelongsToMany } from 'sequelize-typescript';
import { User } from './users';
import { Auction } from './auctions';
import { NFTAuction } from './nft_auctions';

@Table
export class NFT extends Model<NFT> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  nft_id!: string;

  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  nft_name!: string;

  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  description!: string;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
    type: DataType.UUID
  })
  seller_id!: string;

  @BelongsTo(() => User)
  seller: User;

  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  nft_item!: string;

  @Column({
    allowNull: false,
    type: DataType.FLOAT
  })
  starting_price!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true
  })
  sold_price!: number;

  @Column({
    type: DataType.JSON,
    allowNull: true
  })
  bidding_history!: any;

  @BelongsToMany(() => Auction, () => NFTAuction)
  auctions_enrolled!: Auction[];
}
