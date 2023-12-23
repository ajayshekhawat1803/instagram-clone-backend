import { Controller, Get } from "@nestjs/common";

@Controller('health')
export class HealthController {


    @Get()
    checkhealth() {
        return "this server is running well and giving proper response"
    }
}