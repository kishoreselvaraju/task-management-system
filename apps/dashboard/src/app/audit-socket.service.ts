import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuditSocketService implements OnDestroy {
  private socket: Socket | null = null;

  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  connect() {
    if (this.socket) return;

    this.socket = io('http://localhost:3000/audit', {
  withCredentials: true,
  transports: ['websocket'],
  auth: {
    token: localStorage.getItem('access_token'),
  },
});

  }

  onNewAudit(): Observable<any> {
    this.connect();
    return new Observable((subscriber) => {
      const handler = (data: any) => subscriber.next(data);
      this.socket!.on('audit:new', handler);
      return () => this.socket!.off('audit:new', handler);
    });
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
