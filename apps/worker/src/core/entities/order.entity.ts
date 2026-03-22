export interface OrderProps {
  userId: string;
}

export class OrderEntity {
  private constructor(private readonly props: OrderProps) {}

  static create(userId: string): OrderEntity {
    return new OrderEntity({ userId });
  }

  get userId(): string {
    return this.props.userId;
  }
}
