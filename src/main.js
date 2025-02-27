import './style.css'
import { generateTable } from './counter.js'

document.querySelector('#app').appendChild(generateTable(5));
  