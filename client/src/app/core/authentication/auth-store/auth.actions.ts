import { createAction, props } from "@ngrx/store";
import { User } from "../auth.interfaces";

export const login = createAction(
    '[Login] Login Attempt',
    props<{ username: string, password: string }>()
  );

  export const loginSuccess = createAction(
    '[Login] Login Success',
    props<{ user:User }>()
  );

  export const loginFailure = createAction(
    '[Login] Login Failure',
    props<{ error: string }>()
  );

  export const clearAuth = createAction(
    '[Auth] Clear Auth'
  )

  export const logout = createAction(
    '[Auth] Logout'
  )
