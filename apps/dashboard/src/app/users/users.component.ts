// apps/dashboard/src/app/users/users.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../users.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  newEmail = '';
  newPassword = '';
  newRole = 'VIEWER';
  newOrg = '';
  editingUserId: string | null = null;
  editingRole = '';
  loading = false;

  constructor(
    private usersService: UsersService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  createUser() {
    if (!this.newEmail.trim() || !this.newPassword.trim()) return;

    this.usersService
      .createUser({
        email: this.newEmail,
        password: this.newPassword,
        role: this.newRole,
        organizationId: this.newOrg || undefined,
      })
      .subscribe(() => {
        this.newEmail = '';
        this.newPassword = '';
        this.newRole = 'VIEWER';
        this.newOrg = '';
        this.loadUsers();
      });
  }

  startEdit(user: any) {
    this.editingUserId = user.id;
    this.editingRole = user.role;
  }

  saveEdit(user: any) {
    this.usersService.updateUser(user.id, { role: this.editingRole }).subscribe(() => {
      this.editingUserId = null;
      this.loadUsers();
    });
  }

  cancelEdit() {
    this.editingUserId = null;
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.usersService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }

  isAdmin(): boolean {
    return this.auth.getRole() === 'ADMIN';
  }
}
