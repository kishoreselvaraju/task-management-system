import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private auth: AuthService, private router: Router) {}

  isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  getRole() {
    return this.auth.getRole();
  }

  getEmail() {
    return this.auth.getEmail();
  }

  getAvatarLetter() {
    const email = this.getEmail();
    return email ? email.charAt(0).toUpperCase() : '?';
  }

  isAdminOrOwner() {
    const role = this.auth.getRole();
    return role === 'ADMIN' || role === 'OWNER';
  }

  logout(event: Event) {
    event.preventDefault();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
