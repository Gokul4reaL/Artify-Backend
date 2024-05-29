import { Model, Column, Table, PrimaryKey, DataType, ForeignKey, BelongsTo, Sequelize } from 'sequelize-typescript';
import { User } from './users'; // Assuming you have a User model defined

@Table({
  timestamps: true,
  paranoid: true,
  defaultScope: {
    attributes: {
      exclude: ['createdAt', 'deletedAt', 'updatedAt'],
    },
  },
})
export class UserProfile extends Model<UserProfile> {
  @PrimaryKey
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  username!: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  fullName!: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  country!: string;

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  day!: number;

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  month!: number;

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  year!: number;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  gender!: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  profilePhoto!: string;

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  acceptTerms!: boolean;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
    type: DataType.UUID, // Assuming user_id is of type UUID, change it accordingly
  })
  user_id!: string;

  @BelongsTo(() => User)
  user!: User;

}


const sequelize = new Sequelize('artify', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql' // Specify the dialect here
});

const query = `
  ALTER TABLE UserProfiles
  MODIFY COLUMN username VARCHAR(255) COLLATE utf8_bin
`;

async function caseSensitive() {
    try {
      const result = await sequelize.query(query);
      // Handle the result
    } catch (error) {
      // Handle errors
      console.error("Error executing query:", error);
    }
  }
  
  caseSensitive();