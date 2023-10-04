import { endGame } from "./endGame.js"
import { rightAnswer } from "./selectFlag.js"
import { showButtons } from "./showAnswer.js"

export let correctAnswers = 0 

export class Answer{
  constructor(country){
    this.countryName = country.countryName
    this.population = country.population
    this.capital = country.capital
    this.currencies = country.currencies
    
  }

  static async checkCorrectAnswer(){

    let answerInput = document.getElementById('flag-asnwer')
    let userAnswer = formatString(answerInput.value)

    let currentAnswer = rightAnswer

    if(formatString(currentAnswer.countryName) === userAnswer){
      document.querySelector('#flag-asnwer').classList.add('right')
      correctAnswers++
    } else {
      document.querySelector('#flag-asnwer').classList.add('error')

      const tipsDiv =  document.getElementById('tips')
      tipsDiv.innerHTML=''

      const p_answer = document.createElement('p')
      p_answer.innerText = `Nome do país: ${rightAnswer.countryName}` 
      p_answer.id = 'correct-answer'

      tipsDiv.appendChild(p_answer)
    }

    await endGame()

    if(!document.getElementById('see-results-button')) await showButtons()
  }
}

function formatString(countryName){
  countryName = countryName.toUpperCase().replace(/\s/g,'')
  return countryName
}