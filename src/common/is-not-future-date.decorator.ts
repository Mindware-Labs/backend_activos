import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsNotFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (!value) return true;

          const date = new Date(value);
          const today = new Date();
          today.setHours(23, 59, 59, 999);

          return date <= today;
        },
        defaultMessage(_args: ValidationArguments) {
          return 'La fecha no puede ser futura';
        },
      },
    });
  };
}
