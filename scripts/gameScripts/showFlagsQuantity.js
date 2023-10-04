import { alreadyUsedFlags } from "./selectFlag.js"

export default async function showFlagsQuantity(){
  let spans = document.querySelectorAll('.flags-to-answer')
  spans[1].textContent = sessionStorage.getItem('flags_quantity')
  spans[0].textContent = alreadyUsedFlags.length
}