import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...' })
  access_token!: string;

  @ApiProperty({ example: '1d' })
  expires_in!: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Task #1 deleted successfully' })
  message!: string;
}