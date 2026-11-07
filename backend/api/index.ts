import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);
    
    // 🔥 CORS EXPLÍCITO AQUÍ TAMBIÉN
    app.enableCors({
      origin: [
        'https://moa-tradecenter.vercel.app',
        'http://localhost:5173'
      ],
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    app.setGlobalPrefix('api');
    
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    app.use((req, res, next) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      next();
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false, transform: true }));
    
    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp;
}

export default async (req: any, res: any) => {
  const app = await bootstrap();
  return app(req, res);
};