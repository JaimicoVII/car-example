import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

import { Car } from '../models/car';

@Injectable({ providedIn: 'root' })
export class CarsService {

  cars: Car[] = [];
  selectedCar: Car;

  constructor(private http: HttpClient) { }

  getCars() {

    return this.http.get<Car[]>(`${environment.apiUrl}/cars`)
      .pipe(
        map((cars) => { return cars.map((car) => { return this.formatCarResponse(car) }) })
      );

  }

  createCar(data: { make: string, model: string, color: string, plate: string }) {

    let options = {
      make: data.make,
      model: data.model,
      color: data.color,
      plate: data.plate,
    }

    return this.http.post<Car>(`${environment.apiUrl}/cars`, options)
      //.pipe(
      //  map((car) => { return this.formatCarResponse(car) })
      //);
  }


  editCar(id, data) {
    return this.http.put<Car>(`${environment.apiUrl}/cars/${id}`, data)
      .pipe(
        map((car) => { return this.formatCarResponse(car) })
      );
  }

  getCarDetail(id: string) {
    return this.http.get<Car>(`${environment.apiUrl}/cars/${id}`)
      .pipe(
        map((car) => { return this.formatCarResponse(car) })
      );
  }

  deleteCar(id: string) {
    return this.http.delete(`${environment.apiUrl}/cars/${id}`);
  }

  private formatCarResponse(car): Car {
    return new Car(car);
  }

}
