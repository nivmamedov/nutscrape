import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { validate } from 'uuid';

@Injectable()
export class UUIDValidationPipe implements PipeTransform {
  async transform(value: string) {
    if (!validate(value)) {
      throw new BadRequestException('id supplied is not a valid UUID');
    }
    return value;
  }
}
