import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../app/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('home/login')) return next(req);
  if (req.url.includes('external/')) return next(req);

  let modifiedReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${environment.apiKey}`),
  });
  return next(modifiedReq);
};
