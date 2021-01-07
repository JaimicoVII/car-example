import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

const carsData = 'cars-example-data';
let cars = JSON.parse(localStorage.getItem(carsData)) || [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    return handleRoute();

    function handleRoute() {
      switch (true) {
        case url.endsWith('/cars') && method === 'GET':
          return getCars();
        case url.endsWith('/cars') && method === 'POST':
          return createCar();
        case url.match(/\/cars\/\d+$/) && method === 'GET':
          return getCarById();
        case url.match(/\/cars\/\d+$/) && method === 'PUT':
          return updateCar();
        case url.match(/\/cars\/\d+$/) && method === 'DELETE':
          return deleteCar();
        default:
          // pass through any requests not handled above
          return next.handle(request);
      }
    }

    // route functions
    function getCars() {
      return ok(cars.map(x => basicDetails(x)));
    }

    function createCar() {
      const car = body;

      car.id = cars.length ? Math.max(...cars.map(x => x.id)) + 1 : 1;
      cars.push(car);
      localStorage.setItem(carsData, JSON.stringify(cars));
      return ok(basicDetails(car));
    }

    function getCarById() {
      const car = cars.find(x => x.id === idFromUrl());
      return ok(basicDetails(car));
    }

    function updateCar() {
      let params = body;
      let car = cars.find(x => x.id === idFromUrl());

      // update and save car
      Object.assign(car, params);
      localStorage.setItem(carsData, JSON.stringify(cars));

      return ok(basicDetails(car));
    }

    function deleteCar() {

      cars = cars.filter(x => x.id !== idFromUrl());
      localStorage.setItem(carsData, JSON.stringify(cars));
      return ok();
    }

    // helper functions

    function ok(body?) {
      return of(new HttpResponse({ status: 200, body }))
        .pipe(delay(500)); // delay observable to simulate server api call
    }

    function error(message) {
      console.log(message);
      return throwError({ error: { message } })
        .pipe(materialize(), delay(500), dematerialize()); // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648);
    }

    function basicDetails(car) {
      const { id, make, model, color, plate } = car;
      return { id, make, model, color, plate };
    }

    function idFromUrl() {
      const urlParts = url.split('/');
      return parseInt(urlParts[urlParts.length - 1]);
    }
  }
}

export const fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
