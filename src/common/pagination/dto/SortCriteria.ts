import { IsEnum } from 'class-validator';
import { Order } from './order.enum';

class SortCriteria<T> {
  field: T;

  @IsEnum(Order)
  order: Order;
}
export default SortCriteria;
