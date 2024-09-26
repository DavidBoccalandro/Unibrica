import { trigger, state, style, transition, animate } from '@angular/animations';

export const shrinkOutAnimation = trigger('shrinkOut', [
  state('void', style({
    height: '0',
    opacity: 0,
    padding: '0'
  })),
  transition(':enter', [
    style({
      height: '0',
      opacity: 0,
      padding: '0'
    }),
    animate('300ms ease-out', style({
      height: '*',
      opacity: 1,
      padding: '*'
    }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({
      height: '0',
      opacity: 0,
      padding: '0'
    }))
  ])
]);
