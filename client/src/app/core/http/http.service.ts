import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginData, LoginResponse } from './http.interfaces';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


export abstract class HttpBaseService {
  BASIC_URL = environment.envVar.API_URL
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    withCredentials:true
  };

}
