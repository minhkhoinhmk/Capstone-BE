import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Config } from 'aws-sdk';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET, PUT, POST, DELETE, PATCH',
    allowedHeaders: 'Content-Type, Authorization',
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const configService = app.get(ConfigService);
  new Config().update({
    accessKeyId: configService.get('AWS_S3_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_S3_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_S3_REGION'),
  });

  const config = new DocumentBuilder()
    .setTitle('VeCungTreEm API')
    .setDescription('This swagger is about VeCungTreEm API')
    .setVersion('1.0')
    .addTag('APIs')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);
}
bootstrap();
