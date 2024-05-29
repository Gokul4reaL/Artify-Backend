import { Model, Column, Table, PrimaryKey, DataType, HasMany } from 'sequelize-typescript';
import { NFTAuction } from './nft_auctions';

@Table
export class Auction extends Model<Auction> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  auction_id!: string;

  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  auction_name!: string;

  @Column({
    allowNull: false,
    type: DataType.DATE
  })
  start_time!: Date;

  @HasMany(() => NFTAuction)
  auction_items!: NFTAuction[];

  @Column({
    allowNull: true, // Set allowNull to true to allow null values
    type: DataType.DATE
  })
  end_time!: Date | null; // Modify the type to allow null values

}
