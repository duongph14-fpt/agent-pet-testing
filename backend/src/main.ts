import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';
import { LoggingInterceptor } from './common/logging.interceptor';
import { AppConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppConfig, true>);

  const apiPrefix = config.get('apiPrefix', { infer: true });
  const port = config.get('port', { infer: true });
  const corsOrigin = config.get('corsOrigin', { infer: true });

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({ origin: corsOrigin });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(port);
  Logger.log(
    `Server running on http://localhost:${port}/${apiPrefix}`,
    'Bootstrap',
  );
}

void bootstrap();
