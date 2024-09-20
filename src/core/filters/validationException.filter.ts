import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import * as i18n from 'i18n';
import { Connection } from 'typeorm';
import { ActionLogs } from '../database/entities';
import { ERROR } from 'src/shared/constants';

@Catch(ValidationError)
export class ValidationExceptionFilter implements ExceptionFilter {
  constructor(private readonly connection: Connection) {}
  catch(exception: ValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const now = Date.now();

    let language = 'vi';
    if (request.headers['accept-language'] === 'en') {
      language = 'en';
    }

    Logger.error(
      `Api ${request.method} ${request.url} - ${Date.now() - now}ms 
            ${JSON.stringify(exception.constraints)}`,
    );
    Logger.error(request.body);

    const errorMessage = [];

    // tslint:disable-next-line:forin
    for (const i in exception.constraints) {
      errorMessage.push(exception.constraints[i]);
    }
    const msg = errorMessage.join(', ');

    const actionLog = new ActionLogs();
    actionLog.clientIp = request.ip;
    actionLog.path = request.url;
    actionLog.matchedRoute = request.originalUrl;
    actionLog.user = request.user ? JSON.stringify(request.user) : 'Anonymous';
    actionLog.method = request.method;
    actionLog.status = response.statusCode || 200;
    actionLog.request = JSON.stringify({
      body: request.body,
      params: request.params,
    });
    actionLog.header = JSON.stringify(request.headers);
    actionLog.error = msg; // Giả sử 'msg' là biến chứa thông tin lỗi
    actionLog.errorCode = ERROR.VALIDATION_ERROR;

    this.connection.getRepository(ActionLogs).save(actionLog);

    const errTitle = i18n.__({
      phrase: ERROR.VALIDATION_ERROR,
      locale: language,
    });

    response.status(HttpStatus.OK).send({
      status: 'error',
      code: ERROR.VALIDATION_ERROR,
      message: `${errTitle}: ${msg}. Error key: ${exception.property}. Value: ${typeof exception.value !== 'object' ? exception.value : JSON.stringify(exception.value)}`,
    });
  }
}
