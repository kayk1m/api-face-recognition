import {
  Model, Table, Column, DataType,
  CreatedAt, UpdatedAt, DeletedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'photo',
  freezeTableName: true,
  timestamps: true,
  paranoid: true,
  charset: 'utf8',
  collate: 'utf8_general_ci',
})

export class Photo extends Model<Photo> {
  @Column
  url!: string;

  @Column
  nickname!: string;

  @Column(DataType.FLOAT)
  score!: number;

  @Column
  like!: number;

  @CreatedAt
  @Column
  createdAt!: Date;

  @UpdatedAt
  @Column
  updatedAt!: Date;

  @DeletedAt
  @Column
  deletedAt!: Date;
}
