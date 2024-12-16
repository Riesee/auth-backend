import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/signUp.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>, // mongoose using like this. but im using typeorm
    private jwtService: JwtService,
  ) {}

  async signup(signUpData: SignUpDto) {
    const { name, email, password } = signUpData;

    // TODO Check if email is in use
    const emailInUse = await this.userRepository.findOne({
      where: { email: signUpData.email },
    });

    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    // TODO Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // TODO Create User document and save in mySQL
    const newUser = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  async login(credentials: LoginDto) {
    const { email, password } = credentials;
    // TODO find if user exists by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    // TODO Compare entered password with existing password
    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      throw new UnauthorizedException('Wrong password');
    }

    // TODO Generate JWT tokens

    const tokens = await this.generateUserTokens(user.id);

    return {
      ...tokens,
      userId: user.id,
    };
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, expiryDate: MoreThanOrEqual(new Date()) },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.generateUserTokens(token.userId);
  }

  async generateUserTokens(userId) {
    const accessToken = await this.jwtService.sign(
      { userId },
      { expiresIn: '1h' },
    );
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);

    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(token: string, userId: number) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);
    await this.refreshTokenRepository.update(
      { userId },
      {
        token,
        userId,
        expiryDate,
      },
    );
  }
}
