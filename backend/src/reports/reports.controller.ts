import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { ReportsService, ReportParams } from './reports.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

interface DownloadReportDto extends ReportParams {
  format: 'xlsx' | 'pdf';
}

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Viewer, Role.Admin)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

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
}
