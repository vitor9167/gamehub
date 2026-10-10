import {
   Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";

import { UsersService } from "./users.service";

import { FindUsersDto } from "./dto/find-users.dto";
import { AuthGuard } from "../auth/auth.guard";

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get()
  findAll(
    @Query()
    filters: FindUsersDto,
  ) {
    return this.usersService.findAll(
      filters,
    );
  }

  @Get(":username/followers")
  getFollowers(
    @Param("username")
    username: string,
  ) {
    return this.usersService.getFollowers(
      username,
    );
  }

@Get(":username/following")
getFollowing(
  @Param("username")
  username: string,
) {
  return this.usersService.getFollowing(
    username,
  );
}

@Get("feed")
@UseGuards(AuthGuard)
getFeed(
  @Req()
  request: any,

  @Query("page")
  page?: string,

  @Query("limit")
  limit?: string,
) {
  return this.usersService.getFeed(
    request.user.sub,
    Number(page) || 1,
    Number(limit) || 10,
  );
}

@Get(":username/recommendations")
findRecommendations(
  @Param("username")
  username: string,

  @Query("page")
  page?: string,

  @Query("limit")
  limit?: string,
) {
  return this.usersService.findRecommendations(
    username,
    Number(page) || 1,
    Number(limit) || 6,
  );
}

@Get(":username/activity")
findActivity(
  @Param("username")
  username: string,
) {
  return this.usersService.findActivity(
    username,
  );
}

  @Get(":username")
  findByUsername(
    @Param("username")
    username: string,
  ) {
    return this.usersService.findByUsername(
      username,
    );
  }

@Get(":username/library")
findLibrary(
  @Param("username")
  username: string,

  @Query("page")
  page?: string,

  @Query("limit")
  limit?: string,

  @Query("status")
  status?: string,

  @Query("search")
  search?: string,

  @Query("sort")
  sort?: string,
) {
  return this.usersService.findLibrary(
    username,
    Number(page) || 1,
    Number(limit) || 12,
    status,
    search,
    sort,
  );
}

@Get(":username/reviews")
findReviews(
  @Param("username")
  username: string,

  @Query("page")
  page?: string,

  @Query("limit")
  limit?: string,
) {
  return this.usersService.findReviews(
    username,
    Number(page) || 1,
    Number(limit) || 6,
  );
}

@Post(":username/follow")
@UseGuards(AuthGuard)
followUser(
  @Param("username")
  username: string,

  @Req()
  request: any,
) {
  return this.usersService.followUser(
    request.user.sub,
    username,
  );
}

@Delete(":username/follow")
@UseGuards(AuthGuard)
unfollowUser(
  @Param("username")
  username: string,

  @Req()
  request: any,
) {
  return this.usersService.unfollowUser(
    request.user.sub,
    username,
  );
}

@Get(":username/follow-status")
@UseGuards(AuthGuard)
getFollowStatus(
  @Param("username")
  username: string,

  @Req()
  request: any,
) {
  return this.usersService.getFollowStatus(
    request.user.sub,
    username,
  );
}

}

