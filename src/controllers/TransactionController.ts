import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  Delete,
  UseFilters,
} from '@nestjs/common'
import { JoiValidationPipe } from '../validation/JoiValidationPipe'
import { transactionSchema } from '../validation/transactionSchema'
import { Logger } from '@nestjs/common'
import { TransactionRequest } from '../requests/TransactionRequest'
import {
  StatusType,
  TransactionStatusUpdateRequest,
} from '../requests/TransactionStatusUpdateRequest'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { AccountService } from '../services/AccountService'
import config from '../config'
import { TransactionService } from '../services/TransactionService'
import { EthereumAccount } from 'src/data/entities/EthereumAccount'
import { ObjectNotFound } from '../filters/notFound-expection.filter'
import { AllExceptionsFilter } from '../filters/all-exception.filter'
import { ObjectForbidden } from '../filters/forbidden-exception.filter'

require('dotenv').config()

export const VALID_HEALTHCHECK_MESSAGE = 'OK'

@ApiTags('Transaction')
@Controller('custodian')
export class TransactionController {
  constructor(
    private readonly logger: Logger,
    private accountService: AccountService,
    private transactionService: TransactionService,
  ) {}

  @Post(`transaction`)
  @UseFilters(AllExceptionsFilter)
  @UsePipes(new JoiValidationPipe(transactionSchema))
  async createTransaction(@Body() request: TransactionRequest) {
    // FIXME - Done
    let account: EthereumAccount
    if (request.accountId) {
      const accountId = request.accountId
      account = await this.accountService.getAccount(accountId)
    } else {
      if (!account) {
        throw new ObjectNotFound('No such transaction')
      }
    }
    const transaction = await this.transactionService.createTransaction({
      abortedTimestamp: null,
      createdTimestamp: new Date(),
      data: request.data,
      ethereumAccount: account,
      failedTimestamp: null,
      failureReason: null,
      fees: null,
      from: account.address,
      gasLimit: request.gasLimit,
      ...(request.type !== '2' && { gasPrice: request.gasPrice }),
      ...(request.type === '2' && {
        maxPriorityFeePerGas: request.maxPriorityFeePerGas,
      }),
      ...(request.type === '2' && { maxFeePerGas: request.maxFeePerGas }),
      gasUsed: null,
      minedTimestamp: null,
      network: null,
      nonce: null,
      signedRawTransaction: null,
      signedTimestamp: null,
      submittedTimestamp: null,
      to: request.to,
      transactionHash: null,
      transactionStatus: 'created',
      type: request.type,
      userId: config().userUuid,
      value: request.value,
    })
    return transaction
  }

  @Get(`transaction/:id`)
  @ApiOperation({ description: 'Get a single transaction by ID' })
  @UseFilters(AllExceptionsFilter)
  async getTransaction(@Param('id') id: string) {
    // FIXME - Done
    return await this.transactionService.getTransaction(id)
  }

  @Get(`transaction`)
  @ApiOperation({ description: 'Get a transactions filtered by statuses' })
  @ApiQuery({
    name: 'transactionStatuses',
    description: 'transaction statuses to filter by (comma separated)',
  })
  @UseFilters(AllExceptionsFilter)
  async getTransactions(
    // Accepts a comma separated list
    @Query('transactionStatuses') transactionStatuses?: string,
  ) {
    // FIXME - Done
    return this.transactionService.getTransactions(transactionStatuses)
  }

  @Patch('transaction/:id')
  @ApiOperation({ description: 'Update the status of a transaction' })
  @UseFilters(AllExceptionsFilter)
  async updateTransaction(
    @Param('id') id: string,
    @Body() request: TransactionStatusUpdateRequest,
  ): Promise<any> {
    // FIXME - Done
    const transaction = await this.getTransaction(id)
    if (!transaction) {
      throw new ObjectNotFound('No such transaction')
    }
    const currentStatus = transaction.transactionStatus
    const newStatus = request.transactionStatus

    if (currentStatus === 'signed' && newStatus === 'signed') {
      throw new ObjectForbidden(
        'Transaction already signed! Current status: signed',
      )
    } else if (currentStatus === 'created' && newStatus === 'submitted') {
      throw new ObjectForbidden(
        `Transaction must be signed first: current status ${transaction.transactionStatus}`,
      )
    } else if (currentStatus === 'created' && newStatus === 'signed') {
      return await this.transactionService.signTransaction(transaction) // sign
    } else if (currentStatus === 'signed' && newStatus === 'submitted') {
      return await this.transactionService.submitTransaction(transaction) // submit
    } else if (currentStatus === 'signed' && newStatus === 'aborted') {
      return await this.transactionService.abortTransaction(transaction) // abort
    } else if (
      !Object.values(StatusType).includes((newStatus as unknown) as StatusType) // check for valid status
    ) {
      throw new ObjectForbidden(`Invalid status ${newStatus}`)
    }
  }

  @Delete('/transaction')
  @UseFilters(AllExceptionsFilter)
  @ApiOperation({ description: 'Delete a transaction (debug use)' })
  async deleteAllTransactions() {
    // FIXME - Done
    return this.transactionService.deleteAllTransactions()
  }

  @Delete('/transaction/:id')
  @UseFilters(AllExceptionsFilter)
  @ApiOperation({ description: 'Delete a transaction (debug use)' })
  async deleteTransaction(@Param('id') id: string) {
    return this.transactionService.deleteTransaction(id)
  }
}
