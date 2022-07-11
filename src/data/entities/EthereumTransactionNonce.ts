import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity()
export class EthereumTransactionNonce extends BaseEntity {
  @Column()
  lastNonce: number

  @Index({ unique: true })
  @Column()
  address: string
}
