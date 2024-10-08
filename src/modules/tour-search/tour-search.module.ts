import { Module } from '@nestjs/common';
import { ElasticsearchModule, RedisModule } from 'src/core';
import { TourSearchController } from './tour-search.controller';
import { TourSearchbyRegionService, TourSearchService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AgentEntity,
  AgentResourceEntity,
  RoleEntity,
  UserEntity,
  UserRoleEntity,
} from 'src/core/database/entities';
import { UserService } from '../user/agent.service';
import { DataCenterModule } from '../data-center/data-center.module';
import { CurrencyModule } from '../currency/currency.module';
import { TourSearchbyAirportCodeService } from './services/search-by-airport-code.service';
import { TourSearchbyIdService } from './services/search-by-id.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentEntity,
      UserEntity,
      UserRoleEntity,
      RoleEntity,
      AgentResourceEntity,
    ]),
    RedisModule,
    ElasticsearchModule,
    DataCenterModule,
    CurrencyModule,
  ],
  controllers: [TourSearchController],
  providers: [
    TourSearchService,
    UserService,
    TourSearchbyRegionService,
    TourSearchbyAirportCodeService,
    TourSearchbyIdService,
  ],
  exports: [TourSearchService],
})
export class TourSearchModule {}
