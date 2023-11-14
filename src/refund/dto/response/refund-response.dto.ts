import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RefundResponse {
  @ApiProperty({ type: 'string', description: 'Refund id' })
  @Expose()
  id: string;

  @ApiProperty({ type: 'string', description: 'Bank of user' })
  @Expose()
  bank: string;

  @ApiProperty({ type: 'string', description: 'Account number of user' })
  @Expose()
  accountNumber: string;

  @ApiProperty({ type: 'number', description: 'Refund price' })
  @Expose()
  refundPrice: number;

  @ApiProperty({ type: 'string', description: 'Refund id' })
  @Expose()
  refundReason: string;

  @ApiProperty({ type: 'boolean', description: 'Is approved' })
  @Expose()
  isApproved: boolean;

  @ApiProperty({ type: 'date', description: 'Inserted date' })
  @Expose()
  insertedDate: Date;

  @ApiProperty({ type: 'string', description: 'User first name' })
  @Expose()
  firstName: string;

  @ApiProperty({ type: 'string', description: 'User middle name' })
  @Expose()
  middleName: string;

  @ApiProperty({ type: 'string', description: 'User last name' })
  @Expose()
  lastName: string;

  @ApiProperty({ type: 'string', description: 'Course title' })
  @Expose()
  courseTitle: string;
}
