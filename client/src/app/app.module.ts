import { ErrorHandler, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { authFeatureKey, authMetaReducers } from './core/authentication/auth-store';
import { AuthEffects } from './core/authentication/auth-store/auth.effects';
import { AuthReducer } from './core/authentication/auth-store/auth.reducers';
import { metaReducers } from './root-store/index';

import { HttpClientModule } from '@angular/common/http';

import { ErrorHandlerService } from './core/services/error-handler.service';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ErrorPageModule } from './error-page/error-page.module';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BanksService } from './core/services/banks.service';
import { ClientsService } from './core/services/clients.service';
import { UploadFileService } from './core/services/upload-file.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    StoreModule.forRoot(
      {},
      {
        metaReducers,
        runtimeChecks: {
          strictActionImmutability: true,
          strictStateImmutability: true,
          strictActionSerializability: true,
          strictStateSerializability: true,
        },
      }
    ),
    EffectsModule.forRoot([AuthEffects]),
    StoreModule.forFeature(authFeatureKey, AuthReducer, { metaReducers: authMetaReducers }),
    ErrorPageModule,
    MatSnackBarModule,
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    ErrorPageModule,
    // CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory })
    MatDialogModule,
  ],
  providers: [
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    {
      provide: MatDialogRef,
      useValue: {},
    },
    UploadFileService,
    ClientsService,
    BanksService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
