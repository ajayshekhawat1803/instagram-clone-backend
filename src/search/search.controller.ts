import { Controller, Get, Param, Req } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get('/:searchValue')
    async searchUser(@Param('searchValue') searchValue, @Req() req) {
        try {
            const result = await this.searchService.GetUser(searchValue)
            if (result) {
                req.res.status(200)
                return {
                    data: result,
                    message: `Search Results returned`
                }
            } else {
                return {
                    data: null,
                    message: `something went wrong`
                }
            }
        } catch (error) {
            req.res.status(error.status || 500)
            return {
                data: null,
                message: `${error.message}`
            }
        }
    }
}
