import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Auth } from 'src/auth/decorator/auth.decorator';

@Auth("ADMIN")
@Controller('dashboard')
export class DashboardController {
  
  
  constructor(private readonly dashboardService: DashboardService) {

  }



  @Get('purchases')
   getPurchases() {

    return this.dashboardService.getPurchases()

  }


  @Get('users')
  getUsers() {
    
    return "hola"
  }


  
}
