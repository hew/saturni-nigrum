import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

// ASCII art console greeting
console.log(`
%c
                        ┌─────────────┐
                       ╱│            ╱│
                      ╱ │           ╱ │
                     ┌─────────────┐  │
                     │  │          │  │
                     │  │          │  │
                     │  │          │ ╱
                     │  └──────────│╱
                     └─────────────┘

              Let's build together:
              Contact me on x.com/tahini

`, 'font-family: monospace; color: #FFD700; background: #000000; line-height: 1.2;');

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
