import { Component } from '@angular/core';
import { RouterOutlet, Router,RouterLink,RouterLinkActivegi } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,
    RouterOutlet,
    RouterLink,           
    RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private auth: AuthService, private router: Router) {}

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  getRole(): string {
    return this.auth.getRole() ?? '';
  }
  

  getEmail(): string | null {
    return this.auth.getEmail();
  }

  getAvatarLetter(): string {
    const email = this.getEmail();
    return email ? email.charAt(0).toUpperCase() : '?';
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isAdminOrOwner(): boolean {
    const role = this.getRole();
    return role === 'ADMIN' || role === 'OWNER';
  }

  logout(event: Event): void {
    event.preventDefault();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
