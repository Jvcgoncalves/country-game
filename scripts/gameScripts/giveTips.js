import { rightAnswer } from "./selectFlag.js"
import showAnswer from "./showAnswer.js"
export let tipsIndex = 0 

export function giveTips(event) {
  if(event.type === 'touchstart') event.preventDefault()

  const tipDiv = document.getElementById('tips')
  let correctAnswer = rightAnswer

  const p_capital = document.createElement('p')
  const p_currency = document.createElement('p')
  const p_3letters = document.createElement('p')

  switch(tipsIndex){
    case 0:

      p_capital.textContent =`Capital do país: ${correctAnswer.capital ?? 'Não há capital no país'}`
      p_capital.className = 'tips-p'
      tipsIndex++
      tipDiv.appendChild(p_capital)

    break;
    case 1:
      
      let text = JSON.stringify(correctAnswer.currencies) ?? 'Não há moedas no país'

      const answer = text.replace(/[{}":"]/g,'').match(/\D../)

      const currencyName = answer[0] !== 'Não' ? answer[0]  : 'Não há moedas no país'

      console.log(currencyName)
      if(currencyName !== 'Não há moedas no país' && currencyName !== 'Não'){
        p_currency.innerText = `Nome da moeda: ${correctAnswer.currencies[currencyName].name}
        Simbolo da moeda: ${correctAnswer.currencies[currencyName].symbol ?? 'Não há simbolo para a moeda'}`
        p_currency.className = 'tips-p'
      } else {
        p_currency.textContent = currencyName
        p_currency.className = 'tips-p'
      }

      tipsIndex++
      tipDiv.appendChild(p_currency)
    break;
    case 2:

      p_3letters.textContent = `Três primeiras letras: ${correctAnswer.countryName.match(/\D../)}`
      p_3letters.className = 'tips-p'
      tipsIndex++

      tipDiv.appendChild(p_3letters)

      document.getElementById('give-up').removeEventListener('click',giveTips)
      document.getElementById('give-up').removeEventListener('touchstart',giveTips)

      document.getElementById('give-up').textContent = 'Ver resposta'

      document.getElementById('give-up').addEventListener('click',showAnswer)
      document.getElementById('give-up').addEventListener('touchstart',showAnswer)
    break;
        
  }
} 

export async function restartTips(){
  
  document.getElementById('give-up').removeEventListener('click',showAnswer)
  document.getElementById('give-up').removeEventListener('touchstart',showAnswer)
  document.getElementById('give-up').innerText = 'Dicas'
  tipsIndex = 0 
  return
}