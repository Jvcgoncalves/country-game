import { rightAnswer } from "./selectFlag.js"
import showAnswer from "./showAnswer.js"

const language = {
  en:{
    p_capital:`Country's capital:`,
    p_currency:{
      currency_name:`Currency name:`,
      currency_symbol:`Currency symbol:`
    },
    p_3letters: `First three letters:`,
    e_capital_msg:`There is no capital in the country`,
    e_currency_msg: `There is no currency in the country`,
    e_symbol_msg: `There is no symbol for the currency`,
    see_answer:'See answer'
  },
  pt:{
    p_capital:`Capital do país:`,
    p_currency:{
      currency_name:`Nome da moeda:`,
      currency_symbol:`Simbolo da moeda:`
    },
    p_3letters: `Três primeiras letras:`,
    e_capital_msg:`Não há capital no país`,
    e_currency_msg: `Não há moedas no país`,
    e_symbol_msg: `Não há simbolo para a moeda`,
    see_answer:'Ver resposta'
  }
}

export let tipsIndex = 0 

export function giveTips(event) {
  if(event.type === 'touchstart') event.preventDefault()

  const tipDiv = document.getElementById('tips')
  let correctAnswer = rightAnswer

  const p_capital = document.createElement('p')
  const p_currency = document.createElement('p')
  const p_3letters = document.createElement('p')
  let mainLanguage = ''

  if(sessionStorage.getItem('game_language') === "pt_BR"){
    mainLanguage = 'pt'
  } else {
    mainLanguage = 'en'
  }

  switch(tipsIndex){
    case 0:
      
      p_capital.textContent =`${language[mainLanguage].p_capital} ${correctAnswer.capital ?? language[mainLanguage].e_capital_msg}`
      p_capital.className = 'tips-p'
      tipsIndex++
      tipDiv.appendChild(p_capital)

    break;
    case 1:
      
      let text = JSON.stringify(correctAnswer.currencies) ?? language[mainLanguage].e_currency_msg

      const answer = text.replace(/[{}":"]/g,'').match(/\D../)

      const currencyName = answer[0] !== 'Não' ? answer[0]  : language[mainLanguage].e_currency_msg

      if(currencyName !== 'Não há moedas no país' && currencyName !== 'Não' && currencyName !== 'There is no currency in the country' && currencyName !== 'The'){
        p_currency.innerText = `${language[mainLanguage].p_currency.currency_name} ${correctAnswer.currencies[currencyName].name}
        ${language[mainLanguage].p_currency.currency_symbol} ${correctAnswer.currencies[currencyName].symbol ?? language[mainLanguage].e_symbol_msg}`
        p_currency.className = 'tips-p'
      } else {
        p_currency.textContent = currencyName
        p_currency.className = 'tips-p'
      }

      tipsIndex++
      tipDiv.appendChild(p_currency)
    break;
    case 2:

      p_3letters.textContent = `${language[mainLanguage].p_3letters} ${correctAnswer.countryName.match(/\D../)}`
      p_3letters.className = 'tips-p'
      tipsIndex++

      tipDiv.appendChild(p_3letters)

      document.getElementById('give-up').removeEventListener('click',giveTips)
      document.getElementById('give-up').removeEventListener('touchstart',giveTips)

      document.getElementById('give-up').textContent = `${language[mainLanguage].see_answer}`

      document.getElementById('give-up').addEventListener('click',showAnswer)
      document.getElementById('give-up').addEventListener('touchstart',showAnswer)
    break;
        
  }
} 

export async function restartTips(){
  
  document.getElementById('give-up').removeEventListener('click',showAnswer)
  document.getElementById('give-up').removeEventListener('touchstart',showAnswer)

  if(sessionStorage.getItem('game_language') === "pt_BR"){

    document.getElementById('give-up').innerText = 'Dicas'

  } else {

    document.getElementById('give-up').innerText = 'Tips'

  }

  tipsIndex = 0 
  return
}