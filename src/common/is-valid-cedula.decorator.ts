import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsValidCedula(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsValidCedula',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (!value) return true; // si está vacío y es opcional

          //  Convertir a string si llega como num
          const stringValue = String(value);

          // Validar que solo contenga num o guiones
          if (!/^[0-9-]+$/.test(stringValue)) return false;

          // Eliminar guiones
          const cedula = stringValue.replace(/-/g, '').trim();
          if (cedula.length !== 11) return false;

          // Algoritmo dominicano
          const multipliers = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1];
          let total = 0;

          for (let i = 0; i < 11; i++) {
            let calc = parseInt(cedula[i]) * multipliers[i];
            if (calc < 10) total += calc;
            else
              total +=
                parseInt(calc.toString().charAt(0)) +
                parseInt(calc.toString().charAt(1));
          }

          return total % 10 === 0;
        },
        defaultMessage(_args: ValidationArguments) {
          return 'La cédula no pasa la validación oficial';
        },
      },
    });
  };
}
