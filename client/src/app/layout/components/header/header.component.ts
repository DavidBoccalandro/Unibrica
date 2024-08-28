import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { logout } from 'src/app/core/authentication/auth-store/auth.actions';
import { selectUser } from 'src/app/core/authentication/auth-store/auth.selectors';
import { User } from 'src/app/core/authentication/auth.interfaces';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  fingerprintColor = 'primary';
  selfImprovementDisabled = true;
  isChronometerRunning = false;
  chronometerTime = '00:00:00';
  signInTime: string = '';
  signOutTime: string = '';
  totalElapsedMilliseconds = 0;
  user$!: Observable<User | null>;

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.user$ = this.store.select(selectUser);
  }

  onFingerprintClick() {
    this.fingerprintColor = 'warn';
    this.selfImprovementDisabled = false;

    if (!this.signInTime) {
      this.signInTime = this.getCurrentTime();
    } else {
      this.signOutTime = this.getCurrentTime();
    }
  }

  onBreakClick() {
    this.isChronometerRunning = !this.isChronometerRunning;

    if (this.isChronometerRunning) {
      this.startChronometer();
    } else {
      this.stopChronometer();
    }
  }

  private startChronometer() {
    let currentElapsedTime = 0;
    const currentStartTime = Date.now();
    if (this.totalElapsedMilliseconds) {
      currentElapsedTime = this.totalElapsedMilliseconds;
    }
    this.isChronometerRunning = true;


    const updateChronometer = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - currentStartTime + currentElapsedTime;
      const formattedTime = this.formatTime(elapsedTime);
      this.chronometerTime = formattedTime;
      this.totalElapsedMilliseconds = elapsedTime;
      if (this.isChronometerRunning) {
        requestAnimationFrame(updateChronometer);
      }
    };

    requestAnimationFrame(updateChronometer);
  }
  private stopChronometer() {
    this.isChronometerRunning = false;
  }

  private formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  private getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  onLogout() {
    this.store.dispatch(logout());
  }
}
