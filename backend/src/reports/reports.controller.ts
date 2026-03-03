import { Controller, Post, Body, Res, UseGuards, Get, Delete, Param, Put } from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { ReportParams } from './reports.service';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { SubscriptionsRepository } from './subscriptions.repository';
import type { CreateSubscriptionDto } from './subscriptions.repository';

interface DownloadReportDto extends ReportParams {
  format: 'xlsx' | 'pdf';
}

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Viewer, Role.Admin)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly subscriptionsRepo: SubscriptionsRepository,
  ) {}

  @Post('preview')
  async preview(@Body() params: ReportParams) {
    return this.reportsService.getReportData(params);
  }

  @Post('download')
  async download(@Body() params: DownloadReportDto, @Res() res: Response) {
    const data = await this.reportsService.getReportData(params);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `report-${timestamp}`;

    let filePath: string;
    if (params.format === 'xlsx') {
      filePath = await this.reportsService.generateExcel(data, fileName);
    } else {
      filePath = await this.reportsService.generatePDF(data, fileName);
    }

    res.download(filePath);
  }

  @Get('subscriptions')
  async getSubscriptions() {
    return this.subscriptionsRepo.findAll();
  }

  @Post('subscriptions')
  async createSubscription(@Body() data: CreateSubscriptionDto) {
    return this.subscriptionsRepo.create(data);
  }

  @Put('subscriptions/:id')
  async updateSubscription(@Param('id') id: string, @Body() data: any) {
    return this.subscriptionsRepo.update(parseInt(id), data);
  }

  @Delete('subscriptions/:id')
  async deleteSubscription(@Param('id') id: string) {
    return this.subscriptionsRepo.delete(parseInt(id));
  }
}
