import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = true; // false true
  private _userId = 'abc';

  constructor() {}

  get isAuthenticated() {
    return this._isAuthenticated;
  }
  get userid() {
    return this._userId;
  }
  login() {
    this._isAuthenticated = true;
  }
  logout() {
    this._isAuthenticated = false;
  }
}
