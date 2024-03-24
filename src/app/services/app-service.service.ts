import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  commonUrl = 'http://localhost:8080'

  constructor(
    private _http: HttpClient
  ) { }

  getTemplates() {
    return this._http.get(`${this.commonUrl}/template`)
  }
}
