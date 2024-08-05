const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        autumn: {
          ...require('daisyui/src/theming/themes')['autumn'],
          '.active':{
            textShadow:' #000 1px 0 12px'
          },
          '.sideBar':{
            backgroundColor: 'oklch(0.958147 0 0)'
          },
          '.outer-container': {
            position: 'absolute',
            top: '0',
            left: ' 0',
            zIndex: '-10',
            height: '100%',
            width: '100%',
          },
          '.activeBorder': {
            width: '20px',
            height: '20px',
            backgroundColor: 'red',
          },
          '.inner-circle': {
            position: 'absolute',
            top: '0',
            right: '0',
            bottom: 'auto',
            left: 'auto',
            height: '500px',
            width: '500px',
            transform: 'translateX(-30%) translateY(20%)',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 0, 0, 0.5)',
            opacity: '0.5',
            filter: 'blur(80px)',
          },
          '.inner-circle1': {
            position: 'absolute',
            top: '0',
            right: '0',
            bottom: 'auto',
            left: 'auto',
            height: '500px',
            width: '500px',
          },
          '.inner-circle2': {
            position: 'absolute',
            top: '0',
            right: '0',
            bottom: 'auto',
            left: 'auto',
            height: '500px',
            width: '500px',
            transform: 'translateX(-90%) translateY(70%)',
          },
        },
      },
      'coffee',
      'retro',
      'forest',
    ],
    darkMode: ['class', '[data-theme="forest"]'],
  },
  plugins: [require('daisyui')],
};
