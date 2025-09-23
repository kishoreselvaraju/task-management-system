import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
//Protect routes with JWT
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
