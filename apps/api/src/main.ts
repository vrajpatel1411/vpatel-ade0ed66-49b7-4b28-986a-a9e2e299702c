// apps/api/src/main.ts
import { NestFactory }     from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule }       from './app/app.module';

async function bootstrap() {
  const app    = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

   app.enableCors({
    origin:      'http://localhost:4200',
    methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true, 
      forbidNonWhitelisted: true, 
      transform:            true, 
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('RBAC Task Management API')
    .setDescription(
      'NestJS + TypeORM + SQLite backend with JWT auth, ' +
      'role-based access control (Owner › Admin › Viewer), ' +
      'org-scoped tasks, and audit logging.'
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type:        'http',
        scheme:      'bearer',
        bearerFormat:'JWT',
        description: 'Paste your access_token from /auth/login',
      },
      'JWT',   
    )
    .addTag('Auth',          'Register and login — public endpoints')
    .addTag('Organizations', 'View org + team hierarchy')
    .addTag('Tasks',         'CRUD — role and org scoped')
    .addTag('Audit Log',     'Access logs — Owner and Admin only')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,  
      tagsSorter:           'alpha',
      operationsSorter:     'alpha',
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 API running at      http://localhost:${port}`);
  logger.log(`📖 Swagger UI at       http://localhost:${port}/api`);
  logger.log(`📄 OpenAPI JSON at     http://localhost:${port}/api-json`);
}
bootstrap();