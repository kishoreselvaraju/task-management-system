import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';   // 👈 add this
import { AuditService } from '../audit.service';
import { AuditSocketService } from '../audit-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],  
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css'],
})
export class AuditComponent implements OnInit, OnDestroy {
  groupedLogs: { date: string; items: any[] }[] = [];
  allLogs: any[] = [];
  loading = false;
  private sub?: Subscription;

  // filters
  selectedAction: string = 'ALL';
  selectedDate: string = 'ALL';

  constructor(
    private auditService: AuditService,
    private auditSocket: AuditSocketService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.auditService.getLogs().subscribe({
      next: (data) => {
        const normalized = data.map((d) => ({
          ...d,
          action: d.action.toLowerCase(),
          createdAt: new Date(d.createdAt),
        }));
        this.allLogs = normalized;
        this.applyFilters();
        this.loading = false;
      },
      error: () => (this.loading = false),
    });

    this.sub = this.auditSocket.onNewAudit().subscribe((entry) => {
      const normalized = {
        ...entry,
        action: entry.action.toLowerCase(),
        createdAt: new Date(entry.createdAt),
      };
      this.allLogs = [normalized, ...this.allLogs];
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  applyFilters() {
    let filtered = [...this.allLogs];

    // filter by action
    if (this.selectedAction !== 'ALL') {
      filtered = filtered.filter(
        (log) => log.action === this.selectedAction.toLowerCase()
      );
    }

    // filter by date (only today / yesterday supported in this example)
    if (this.selectedDate === 'TODAY') {
      const today = new Date();
      filtered = filtered.filter((log) =>
        this.sameDay(log.createdAt, today)
      );
    } else if (this.selectedDate === 'YESTERDAY') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      filtered = filtered.filter((log) =>
        this.sameDay(log.createdAt, yesterday)
      );
    }

    this.groupedLogs = this.groupByDate(filtered);
  }

  private groupByDate(logs: any[]) {
    const groups: { [key: string]: any[] } = {};
    logs.forEach((log) => {
      const d = this.formatDateLabel(log.createdAt);
      if (!groups[d]) groups[d] = [];
      groups[d].push(log);
    });

    return Object.keys(groups).map((date) => ({
      date,
      items: groups[date].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      ),
    }));
  }

  private formatDateLabel(date: Date): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (this.sameDay(date, today)) return 'Today';
    if (this.sameDay(date, yesterday)) return 'Yesterday';

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private sameDay(a: Date, b: Date) {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }
}
