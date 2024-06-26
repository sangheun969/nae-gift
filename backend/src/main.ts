import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      credentials: true,
      origin: ['http://localhost:3000', 'https://nae-gift.com'],
    },
  });

  const config = new DocumentBuilder()
    .setTitle('NaeGift')
    .setDescription('KGA DID project.')
    .setVersion('0.11.0')
    .addTag('Market')
    .addTag('Market | Product')
    .addTag('Market | Store')
    .addTag('Account | Gift')
    .addTag('TEST | VC')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
