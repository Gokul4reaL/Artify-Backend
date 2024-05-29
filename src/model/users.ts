import { Model, Column, Table, PrimaryKey, DataType, CreatedAt, UpdatedAt, DeletedAt, BeforeValidate } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({
  timestamps: true,
  paranoid: true,
  defaultScope: {
    attributes: {
      exclude: ['createdAt', 'deletedAt', 'updatedAt'],
    },
  },
})
export class User extends Model<User> {
  @PrimaryKey
  @Column({
    allowNull: false,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  user_id!: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  email!: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  mobileNumber!: string;
  
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  password!: string;

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  userProfile!: boolean;

  @Column({ // Define user_type column
    allowNull: false,
    type: DataType.ENUM('user', 'admin'), // Enum type with available options
    defaultValue: 'user', // Default value is 'user'
  })
  user_type!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;

  @BeforeValidate
  static generateId(instance: User) {
    if (!instance.id) {
      instance.id = uuidv4();
    }
  }
}
