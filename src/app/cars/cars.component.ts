import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { Observable, Subscription, throwError } from 'rxjs';
import { map, catchError, filter, first } from 'rxjs/operators';

import { BsModalRef } from 'ngx-bootstrap/modal';

import { Car } from '../models/car';
import { CarsService } from '../services/cars.service';

const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ backgroundColor: 'grey', opacity: 0 }), animate('1200ms', style({ backgroundColor: 'white', opacity: 1 }))]
  )
]);

@Component({
  selector: 'app-cars',
  templateUrl: 'cars.component.html',
  //styleUrls: ['./companies.component.css'],
  animations: [fadeAnimation]
})
export class CarsComponent {

  @ViewChild('createCarModal') createCarModal: BsModalRef;

  createForm: FormGroup;
  submitted: boolean = false;
  creatingCar: boolean = false;

  carsList: Car[] = [];
  carsResult$: Observable<Car[]>;
  carsQtyReturn: number = 0;
  loadingCars: boolean = false;
  errorLoadingCars: boolean = false;
  recentCars: Car[] = [];

  subs: Subscription[] = [];

  get cf() { return this.createForm.controls }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private carsService: CarsService) { }

  ngOnInit() {
    this.initialForm();

    this.onSearchCars();
  }

  private initialForm() {
    this.createForm = this.fb.group({
      make: ['', Validators.required],
      model: ['', Validators.required],
      color: ['', Validators.required],
      plate: ['', Validators.required],
    });
  }

  onSearchCars() {

    this.errorLoadingCars = false;
    this.loadingCars = true;

    this.carsQtyReturn = 0;
    this.carsList = [];
    this.recentCars = [];

    this.carsResult$ = this.carsService.getCars()
      .pipe(
        map((cars: Car[]) => {
          let tmpCars = cars.filter((car: Car) => { return !this.recentCars.find(c => c.id === car.id) });
          this.carsQtyReturn = tmpCars.length;
          this.carsList = [...this.carsList, ...tmpCars];
          this.loadingCars = false;
          return this.carsList;
        }),
        catchError((error) => {
          this.errorLoadingCars = true;
          this.loadingCars = false;
          return throwError(error);
        })
      );
  }

  onCreateCar() {
    this.submitted = true;

    if (this.createForm.valid) {
      this.creatingCar = true;

      this.carsService.createCar(this.createForm.value).pipe(first())
        .subscribe(
          (car: Car) => {
            console.log(car);
            alert(`${car.make} ${car.model} ${car.color} was created!`)

            this.createCarModal.hide();
            this.creatingCar = false;

            this.recentCars.unshift(car);
          },
          (error) => {
            console.log(error);
            this.creatingCar = false;

            alert(`Oops... Something went wrong! Try again later`)

          });
    }

  }

  resetCreateForm() {
    this.submitted = false;
    this.creatingCar = false;
    this.createForm.markAsPristine();
    this.createForm.markAsUntouched();
    this.createForm.reset();
  }

  onCarDetail(car: Car) {
    this.carsService.selectedCar = car;
    this.router.navigate(['cars', 'edit', car.id]);
  }

  onCarRemove(car: Car) {
    if (confirm(`Are you sure to delete ${car.make} ${car.model} (id:${car.id})`)) {
      this.carsService.deleteCar(car.id).pipe(first())
        .subscribe(() => {
          this.onSearchCars();
        })
    }
  }

  ngOnDestroy() {

  }
}
