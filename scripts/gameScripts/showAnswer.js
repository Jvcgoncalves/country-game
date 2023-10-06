import { giveTips, restartTips, tipsIndex } from "./giveTips.js"
import { getCountry, rightAnswer } from "./selectFlag.js"

export default function showAnswer(event){

  if(event.type === 'touchstart') event.preventDefault()

  const tipsDiv =  document.getElementById('tips')
  tipsDiv.innerHTML=''

  const p_answer = document.createElement('p')
  if(sessionStorage.getItem('game_language') === "pt_BR"){
    
    p_answer.innerText = `Nome do país: ${rightAnswer.countryName}` 

  } else {

    p_answer.innerText = `Country's name: ${rightAnswer.countryName}` 

  }
  
  p_answer.id = 'correct-answer'

  tipsDiv.appendChild(p_answer)

  if(tipsIndex === 2){

    document.getElementById('give-up').removeEventListener('click',showAnswer)
    document.getElementById('give-up').removeEventListener('touchstart',showAnswer)

  }

  showButtons()
}

export async function nextFlag(event) {
  if(event.type === 'touchstart') event.preventDefault()

  let answerInput = document.getElementById('flag-asnwer')

  await getCountry()

  document.getElementById('tips').innerHTML = ''
  answerInput.focus()
  answerInput.value= ''

  await restartTips()

  const gameButtons = document.querySelectorAll('.main-game-buttons')
  gameButtons.forEach(ev=>{
    ev.style.display = ''
  })

  const nextFlagButton = document.getElementById('next-flag')
  nextFlagButton.classList.toggle('disable')

  document.getElementById('give-up').addEventListener('click',giveTips)
  document.getElementById('give-up').addEventListener('touchstart',giveTips)

  if(document.querySelector('#flag-asnwer.error')){
    document.querySelector('#flag-asnwer.error').classList.remove('error')
  } else if (document.querySelector('#flag-asnwer.right')){
    document.querySelector('#flag-asnwer.right').classList.remove('right')
  }
}

export async function showButtons () {
  const gameButtons = document.querySelectorAll('.main-game-buttons')
  gameButtons.forEach(ev=>{
    ev.style.display = 'none'
  })

  const nextFlagButton = document.getElementById('next-flag')
  nextFlagButton.classList.toggle('disable')
}