import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // 🔥 CONFIGURACIÓN DE CORS EXPLÍCITA PARA PRODUCCIÓN Y LOCAL
    app.enableCors({
      origin: [
        'https://moa-tradecenter.vercel.app', // Tu frontend en Vercel
        'http://localhost:5173'               // Tu frontend local (Vite)
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
    
    // En Vercel (producción), la app se inicializa a través de api/index.ts.
    // En local (desarrollo), levantamos el servidor en el puerto 3000.
    if (process.env.NODE_ENV !== 'production') {
      const port = Number(process.env.PORT ?? 3000);
      await app.listen(port, '0.0.0.0');
      console.log(`🚀 Backend running locally on port ${port}`);
    }
    
  } catch (error) {
    // Imprime el error real en los logs de Vercel si algo falla al iniciar
    console.error('❌ ERROR FATAL AL INICIAR LA APP:', error);
    process.exit(1);
  }
}
bootstrap();