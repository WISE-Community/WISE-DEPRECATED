import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';

export const bounceIn = trigger('bounceIn', [
  state(
    'void',
    style({
      opacity: 0
    })
  ),
  state(
    '*',
    style({
      opacity: 1
    })
  ),
  transition(
    'void => *',
    [
      animate(
        '{{ duration }} {{ delay }} ease-in-out',
        keyframes([
          style({
            transform: 'scale3d(0.3, 0.3, 0.3)',
            opacity: 0,
            offset: 0
          }),
          style({
            transform: 'scale3d(1.1, 1.1, 1.1)',
            opacity: 1,
            offset: 0.2
          }),
          style({
            transform: 'scale3d(0.9, 0.9, 0.9)',
            offset: 0.4
          }),
          style({
            transform: 'scale3d(1.03, 1.03, 1.03)',
            offset: 0.6
          }),
          style({
            transform: 'scale3d(1, 1, 1))',
            offset: 0.8
          }),
          style({
            transform: 'scale3d(1, 1, 1)',
            offset: 1
          })
        ])
      )
    ],
    { params: { duration: '1s', delay: '0s' } }
  )
]);

export const flipInX = trigger('flipInX', [
  state(
    'void',
    style({
      opacity: 0,
      backfaceVisibility: 'visible !important'
    })
  ),
  state(
    '*',
    style({
      opacity: 1,
      backfaceVisibility: 'visible !important'
    })
  ),
  transition(
    'void => *',
    [
      animate(
        '{{ duration }} {{ delay }}',
        keyframes([
          style({
            transform: 'perspective(400px) rotate3d(1, 0, 0, 90deg)',
            animationTimingFunction: 'ease-in',
            opacity: 0,
            offset: 0
          }),
          style({
            transform: 'perspective(400px) rotate3d(1, 0, 0, -20deg)',
            animationTimingFunction: 'ease-in',
            opacity: 1,
            offset: 0.4
          }),
          style({
            transform: 'perspective(400px) rotate3d(1, 0, 0, 10deg)',
            offset: 0.6
          }),
          style({
            transform: 'perspective(400px) rotate3d(1, 0, 0, -5deg)',
            offset: 0.8
          }),
          style({
            transform: 'perspective(400px)',
            offset: 1
          })
        ])
      )
    ],
    { params: { duration: '1s', delay: '0s' } }
  )
]);

export const flipInY = trigger('flipInY', [
  state(
    'void',
    style({
      opacity: 0,
      backfaceVisibility: 'visible !important'
    })
  ),
  state(
    '*',
    style({
      opacity: 1,
      backfaceVisibility: 'visible !important'
    })
  ),
  transition(
    'void => *',
    [
      animate(
        '{{ duration }} {{ delay }}',
        keyframes([
          style({
            transform: 'perspective(400px) rotate3d(0, 1, 0, 90deg)',
            animationTimingFunction: 'ease-in',
            opacity: 0,
            offset: 0
          }),
          style({
            transform: 'perspective(400px) rotate3d(0, 1, 0, -20deg)',
            animationTimingFunction: 'ease-in',
            opacity: 1,
            offset: 0.4
          }),
          style({
            transform: 'perspective(400px) rotate3d(0, 1, 0, 10deg)',
            offset: 0.6
          }),
          style({
            transform: 'perspective(400px) rotate3d(0, 1, 0, -5deg)',
            offset: 0.8
          }),
          style({
            transform: 'perspective(400px)',
            offset: 1
          })
        ])
      )
    ],
    { params: { duration: '1s', delay: '0s' } }
  )
]);

export const rotateIn = trigger('rotateIn', [
  state(
    'void',
    style({
      opacity: 0
    })
  ),
  state(
    '*',
    style({
      opacity: 1
    })
  ),
  transition(
    'void => *',
    [
      animate(
        '{{ duration }} {{ delay }}',
        keyframes([
          style({
            transformOrigin: 'center',
            transform: 'rotate3d(0, 0, 1, -200deg)',
            opacity: 0,
            offset: 0
          }),
          style({
            transformOrigin: 'center',
            transform: 'rotate3d(0, 0, 0, 0)',
            opacity: 1,
            offset: 0.5
          })
        ])
      )
    ],
    { params: { duration: '1s', delay: '0s' } }
  )
]);

export const zoomIn = trigger('zoomIn', [
  state(
    'void',
    style({
      opacity: 0
    })
  ),
  state(
    '*',
    style({
      opacity: 1
    })
  ),
  transition(
    'void => *',
    [
      animate(
        '{{ duration }} {{ delay }}',
        keyframes([
          style({
            transform: 'scale3d(0.3, 0.3, 0.3)',
            opacity: 0,
            offset: 0
          }),
          style({
            transform: 'scale3d(1, 1, 1)',
            opacity: 1,
            offset: 0.5
          })
        ])
      )
    ],
    { params: { duration: '1s', delay: '0s' } }
  )
]);

export const jackInTheBox = trigger('jackInTheBox', [
  state(
    'void',
    style({
      opacity: 0
    })
  ),
  state(
    '*',
    style({
      opacity: 1
    })
  ),
  transition(
    'void => *',
    [
      animate(
        '{{ duration }} {{ delay }}',
        keyframes([
          style({
            opacity: 0,
            transform: 'scale(0.1) rotate(30deg)',
            transformOrigin: 'center bottom',
            offset: 0
          }),
          style({
            transform: 'rotate(-10deg)',
            opacity: 1,
            offset: 0.3
          }),
          style({
            transform: 'rotate(3deg)',
            offset: 0.6
          }),
          style({
            transform: 'scale(1)',
            offset: 0.8
          })
        ])
      )
    ],
    { params: { duration: '1s', delay: '0s' } }
  )
]);

export const flash = trigger('flash', [
  state(
    'void',
    style({
      opacity: 0
    })
  ),
  state(
    '*',
    style({
      opacity: 1
    })
  ),
  transition(
    'void => *',
    [
      animate(
        '{{ duration }} {{ delay }}',
        keyframes([
          style({ opacity: 1 }),
          style({ opacity: 0 }),
          style({ opacity: 1 }),
          style({ opacity: 0 }),
          style({ opacity: 1 })
        ])
      )
    ],
    { params: { duration: '2s', delay: '0s' } }
  )
]);
