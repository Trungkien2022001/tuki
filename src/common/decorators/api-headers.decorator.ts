import { applyDecorators } from '@nestjs/common';
import { ApiHeaders } from '@nestjs/swagger';
import { REQUEST_HEADERS } from 'src/shared/constants';
import { TRequestHeader } from 'src/shared/types';

interface HeaderOption {
  name: string;
  require: boolean;
  schema: object;
}

export function QrnetStandardApiHeaders(...headers: TRequestHeader[]) {
  const headerOptions = headers
    .map((header) => {
      switch (header.toLowerCase()) {
        case REQUEST_HEADERS.APP_VERSION:
          return {
            name: 'app-version',
            required: false,
            schema: { type: 'string' },
          };
        case REQUEST_HEADERS.AUTHORIZATION:
          return {
            name: 'Authorization',
            required: true,
            schema: { type: 'string' },
          };
        default:
          return;
      }
    })
    .filter((i) => i) as unknown as HeaderOption[];

  return applyDecorators(ApiHeaders(headerOptions));
}
