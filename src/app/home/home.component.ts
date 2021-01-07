import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { CarsService } from '../services/cars.service';


@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {

  totalCars: number;
  totalCarsLoading: boolean = true;

  constructor(private carsService: CarsService) { }

  ngOnInit() {
    this.carsService.getCars().pipe(first()).subscribe(cars => { this.totalCars = cars.length; this.totalCarsLoading = false; });
  }
}
