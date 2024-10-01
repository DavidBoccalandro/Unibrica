import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { AuthState } from '../core/authentication/auth.interfaces';
import { User } from './../core/authentication/auth.interfaces';
import { selectUser } from '../core/authentication/auth-store/auth.selectors';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  isEditing = false;
  user!: User | null;
  userSub$!: Subscription;

  constructor(
    private fb: FormBuilder,
    private store: Store<AuthState>
  ) {}

  ngOnInit() {
    this.userSub$ = this.store.select(selectUser).subscribe(
      (user) => {this.user = user}
    )
    this.profileForm = this.fb.group({
      username: [this.user?.name, Validators.required],
      email: [this.user?.email, [Validators.required, Validators.email]],
      name: ['Julian', Validators.required],
      lastName: ['Marc', Validators.required],
    });
    this.profileForm.disable();
  }

  ngOnDestroy(): void {
    this.userSub$.unsubscribe();
  }

  toggleEdit() {
    if (this.isEditing) {
      this.profileForm.disable();
    } else {
      this.profileForm.enable();
    }

    this.isEditing = !this.isEditing;
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.profileForm.disable();
      this.isEditing = false;
    }
  }


}
