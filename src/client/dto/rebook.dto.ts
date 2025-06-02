import {  IsNotEmpty } from 'class-validator';

export class RebookDto {
 
  @IsNotEmpty()
  oldBookingId: string;

 
  @IsNotEmpty()
  newScheduleId: string;


  @IsNotEmpty()
  clientId: string;
}
