export class Car {
  id: string;
  make: string;
  model: string;
  color: string;
  plate: string;

  constructor(_car: any) {
    this.id = _car.id;
    this.make = _car.make;
    this.model = _car.model;
    this.color = _car.color;
    this.plate = _car.plate;
  }
}
