import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { SignUpDto } from './dto/signUp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-tokens.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // TODO: POST SIGNUP
  @Post('signup') //auth/signup
  async signUp(@Body() signUpData: SignUpDto){
    await this.authService.signup(signUpData);
  }

  // TODO: POST LOGIN
  @Post('login') //auth/login
  async login(@Body() credentials: LoginDto){
    return await this.authService.login(credentials);
  }

  // TODO: POST REFRESH TOKEN
  @Post('refresh') //auth/login
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto){
    return await this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }




  ///

  // @Post()
  // create(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
