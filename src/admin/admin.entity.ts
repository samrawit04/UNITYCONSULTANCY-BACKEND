// import { Role } from 'src/auth/enum/role.enum';
// import { AccountStatusEnum } from 'src/shared/enums';
// import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// @Entity()
// export class Admin {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ nullable: true })
//   password?: string;

//   @Column()
//   email: string;

//   @Column({
//     type: 'enum',
//     enum: Role,
//     default: Role.ADMIN,
//   })
//   role: Role;

//   @Column({
//     type: 'enum',
//     enum: AccountStatusEnum,
//     default: AccountStatusEnum.PENDING,
//   })
//   status: string;
// }
