import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: envs.frontendUrl,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API Gestión de Activos Fijos')
    .setDescription(
      'API REST para gestión integral de activos fijos, depreciación, empleados y departamentos',
    )
    .setVersion('1.0')
    .addTag('departments', 'Gestión de departamentos')
    .addTag('employees', 'Gestión de empleados')
    .addTag('asset-types', 'Tipos de activos')
    .addTag('fixed-assets', 'Activos fijos')
    .addTag('depreciation-calculations', 'Cálculos de depreciación')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(envs.port);
  console.log(`App Running on port ${envs.port}`);
  console.log(
    `Swagger documentation available at http://localhost:${envs.port}/api/docs`,
  );
}
bootstrap();
