import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, databaseConfig } from './infrastructure/config/env.config';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { UserHttpModule } from './presentation/http/user/user-http.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),
    PrismaModule,
    UserHttpModule,
  ],
})
export class AppModule {}
