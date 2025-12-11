import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        
        if (!redisUrl) {
          console.warn('⚠️ REDIS_URL not configured. Redis features will be disabled.');
          return null;
        }

        const redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        });

        redis.on('connect', () => {
          console.log('✅ Redis connected successfully');
        });

        redis.on('error', (err) => {
          console.error('❌ Redis connection error:', err.message);
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
