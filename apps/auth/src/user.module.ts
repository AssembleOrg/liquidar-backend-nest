import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity'; // Ajusta el path según tu estructura
import { UserService } from './services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // <-- Esto es CLAVE
    // otros imports...
  ],
  providers: [UserService],
  exports: [UserService], // si lo necesitas en otros módulos
})
export class UserModule {}