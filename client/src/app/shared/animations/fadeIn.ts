import { trigger, state, style, transition, animate } from '@angular/animations';

export const fadeInOutAnimation = trigger('fadeInOut', [
  state('void', style({
    opacity: 0,
    transform: 'translateY(-20px)'
  })),
  transition(':enter', [
    animate('500ms ease-out', style({
      opacity: 1,
      transform: 'translateY(0)'
    }))
  ]),
  transition(':leave', [
    animate('500ms ease-in', style({
      opacity: 0,
      transform: 'translateY(-50px)'
    }))
  ])
]);
