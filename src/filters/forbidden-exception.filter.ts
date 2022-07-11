import {
  Catch,
  HttpStatus,
  HttpException,
} from '@nestjs/common'

@Catch()
export class ObjectForbidden extends HttpException {
  constructor(msg?: string, status?: HttpStatus) {
    super(msg || 'Forbidden!', status || HttpStatus.FORBIDDEN)
  }
}
