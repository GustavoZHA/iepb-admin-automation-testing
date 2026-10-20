import { APIRequestContext, APIResponse, TestInfo } from '@playwright/test';
import { logger } from '../utils/logger';
import { env } from '../../config/env.config';

export interface RequestOptions {
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
}

export class ApiClient {
  constructor(
    private request: APIRequestContext,
    private testInfo?: TestInfo
  ) {}

  private async execute(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    options?: RequestOptions
  ): Promise<APIResponse> {
    const shouldLogHttp = env.logging?.http ?? true;

    // 1. Log Request
    if (shouldLogHttp) {
      logger.info(`-------- HTTP REQUEST [${method}] --------`);
      logger.info(`Endpoint: ${endpoint}`);
      if (options?.headers && Object.keys(options.headers).length > 0) {
        logger.info(`Headers: ${JSON.stringify(options.headers, null, 2)}`);
      }
      if (options?.data) {
        logger.info(`Payload: ${JSON.stringify(options.data, null, 2)}`);
      }
      if (options?.params) {
        logger.info(`QueryParams: ${JSON.stringify(options.params, null, 2)}`);
      }
    }

    let response: APIResponse;
    try {
      response = await this.request.fetch(endpoint, {
        method,
        headers: options?.headers,
        data: options?.data,
        params: options?.params,
      });
    } catch (error) {
      logger.error(`❌ Request Failed Before Response [${method} ${endpoint}]: ${(error as Error).message}`);
      throw error;
    }

    const status = response.status();
    let responseBodyText = '';

    try {
      responseBodyText = await response.text();
    } catch {
      responseBodyText = '[No content / Binary]';
    }

    // 2. Safe JSON parsing
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(responseBodyText);
    } catch {
      parsedBody = responseBodyText;
    }

    // 3. Log Response (Clean without execution duration)
    const isError = status >= 400;
    const logMethod = isError ? logger.error.bind(logger) : logger.info.bind(logger);

    if (shouldLogHttp || isError) {
      logMethod(`Response Status: ${status}`);
      logMethod(`Response Headers: ${JSON.stringify(response.headers(), null, 2)}`);
      logMethod(`Response Body: ${JSON.stringify(parsedBody, null, 2)}`);
      logMethod(`-----------------------------------------------------`);
    }

    // 4. Attach request & response data to Playwright HTML Report
    if (this.testInfo) {
      try {
        await this.testInfo.attach(`HTTP_${method}_${status}`, {
          contentType: 'application/json',
          body: JSON.stringify(
            {
              request: {
                method,
                endpoint,
                headers: options?.headers,
                body: options?.data,
                params: options?.params,
              },
              response: {
                status,
                headers: response.headers(),
                body: parsedBody,
              },
            },
            null,
            2
          ),
        });
      } catch {
        // Safe guard in case testInfo is unavailable
      }
    }

    return response;
  }

  get(endpoint: string, options?: RequestOptions) {
    return this.execute('GET', endpoint, options);
  }

  post(endpoint: string, options?: RequestOptions) {
    return this.execute('POST', endpoint, options);
  }

  put(endpoint: string, options?: RequestOptions) {
    return this.execute('PUT', endpoint, options);
  }

  patch(endpoint: string, options?: RequestOptions) {
    return this.execute('PATCH', endpoint, options);
  }

  delete(endpoint: string, options?: RequestOptions) {
    return this.execute('DELETE', endpoint, options);
  }
}
