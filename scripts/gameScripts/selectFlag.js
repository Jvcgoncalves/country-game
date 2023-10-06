import { Answer } from "./confirmAnswer.js"
import showFlagsQuantity from "./showFlagsQuantity.js"

export let alreadyUsedFlags = []
export let rightAnswer;


export class SelectFlag{
  constructor(country){
    if(sessionStorage.getItem('game_language') === "pt_BR"){
      this.countryName = country.translations.por.common
    } else{
      this.countryName = country.name.common
    }
    this.flag = country.flags.svg
    this.capital = country.capital
    this.currencies = country.currencies

    renderFlag(this)
  }
}

async function renderFlag(country){
  const current_flag = document.querySelector('#current-flag')

  current_flag.src = country.flag

  rightAnswer = new Answer(country)
}

async function selectRandomNumber(){
  let number = Math.floor(Math.random() * 249)
  if(alreadyUsedFlags.includes(number)){

    do{

      number = Math.floor(Math.random() * 249)

    } while (alreadyUsedFlags.includes(number))

  }
  return number
}

export async function getCountry(){

  const response = await fetch('https://restcountries.com/v3.1/all')
  const countrys = await response.json()

  let nextFlag = await selectRandomNumber()

  new SelectFlag(countrys[nextFlag])

  alreadyUsedFlags.push(nextFlag)
  
  await showFlagsQuantity()
}