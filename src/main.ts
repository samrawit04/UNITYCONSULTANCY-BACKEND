import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';


import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: 'http://localhost:8080',
    methods: 'GET,POST,PUT,DELETE,PATCH', // Adjust allowed methods as needed
    allowedHeaders: 'Content-Type, Authorization', // Adjust allowed headers
  });

  // Use express-session middleware
  app.use(
    session({
      secret: 'kjyblitfgybhjtv87g giuk', // replace with a strong secret in production
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

 app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    validationError: {
      target: false,
      value: false,
    },
  }),
);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  await app.listen(3000);
}
bootstrap();
