// apps/dashboard/src/app/users.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createUser(data: { email: string; password: string; role: string; organizationId?: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateUser(id: string, changes: Partial<any>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, changes);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
