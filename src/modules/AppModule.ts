import { Module } from '@nestjs/common'
import { HealthCheckModule } from './HealthCheckModule'
import { LoggerModule } from 'nestjs-pino'
import { CustodianModule } from './CustodianModule'
import { APP_GUARD } from '@nestjs/core' 
import { TerminusModule } from '@nestjs/terminus'
import { TerminusOptionsService } from '../services/TerminusOptionsService'
import { TypeOrmModule } from '@nestjs/typeorm'
import config from '../config'
import { EthereumTransaction } from '../data/entities/EthereumTransaction'
import { ScheduleModule } from '@nestjs/schedule'
import { EthereumAccount } from '../data/entities/EthereumAccount'
import { EthereumTransactionNonce } from 'src/data/entities/EthereumTransactionNonce'

const imports = [
  LoggerModule.forRoot(),
  TypeOrmModule.forRoot({
    ...config().db,
    entities: [EthereumTransaction, EthereumAccount, EthereumTransactionNonce],
  }),
  TerminusModule.forRootAsync({
    useClass: TerminusOptionsService,
  }),
  HealthCheckModule,
  CustodianModule,
  ScheduleModule.forRoot(),
]

@Module({
  imports: imports,
  controllers: [],
  providers: [],
})
export class AppModule {}
