import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    app.enableCors();
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
    
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port, '0.0.0.0'); 
    console.log(`Backend running on port ${port}`);
  } catch (error) {
    // 🔥 ESTO ES CLAVE: Imprime el error real en los logs de Vercel
    console.error('❌ ERROR FATAL AL INICIAR LA APP:', error);
    process.exit(1);
  }
}
bootstrap();