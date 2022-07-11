import {
  Catch,
  HttpStatus,
  HttpException,
} from '@nestjs/common'

@Catch()
export class ObjectNotFound extends HttpException {
  constructor(msg?: string, status?: HttpStatus) {
    super(msg || 'No such object', status || HttpStatus.NOT_FOUND)
  }
}
