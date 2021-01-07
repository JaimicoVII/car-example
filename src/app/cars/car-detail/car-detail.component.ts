import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import { CarsService } from '../../services/cars.service';
import { Car } from '../../models/car';

@Component({ templateUrl: 'car-detail.component.html' })
export class CarDetailComponent {

  editForm: FormGroup;
  submitted: boolean = false;

  car: Car;

  carLoading: boolean = true;
  editingCar = false;

  sub: Subscription;

  get ef() { return this.editForm.controls }

  constructor(
    private carsService: CarsService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {

    this.initialForm();

    this.sub = this.route.params.subscribe(params => {
      this.carsService.getCarDetail(params['id']).pipe(first())
        .subscribe((car: Car) => {
          this.car = car;
          this.editForm.patchValue(car);
          this.carLoading = false;
        })
    });
  }

  private initialForm() {
    this.editForm = this.fb.group({
      make: ['', Validators.required],
      model: ['', Validators.required],
      color: ['', Validators.required],
      plate: ['', Validators.required],
    });
  }

  onEditCar() {
    this.submitted = true;

    if (this.editForm.valid) {
      this.editingCar = true;

      this.carsService.editCar(this.car.id, this.editForm.value).pipe(first())
        .subscribe(
          (car: Car) => {
            console.log(car);
            alert(`${car.make} ${car.model} ${car.color} was edited!`)

            this.editingCar = false;
            this.router.navigate(['cars']);
          },
          (error) => {
            console.log(error);
            this.editingCar = false;

            alert(`Oops... Something went wrong! Try again later`)

          });
    }

  }

  onCarRemove() {
    if (confirm(`Are you sure to delete ${this.car.make} ${this.car.model} (id:${this.car.id})`)) {
      this.editingCar = true;
      this.carsService.deleteCar(this.car.id).pipe(first())
        .subscribe(() => {
          this.router.navigate(['cars']);
        })
    }
  }


  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
