import { Answer } from "./confirmAnswer.js";
import { checkResults } from "./endGame.js";
import { giveTips} from "./giveTips.js";
import { getCountry } from "./selectFlag.js";
import { nextFlag } from "./showAnswer.js";
import { uptadeLanguage } from "./translateGame.js";

getCountry()

function checkLanguage(){
  if(sessionStorage.getItem('game_language') === "pt_BR"){
    document.querySelector('.flag-language').src = '../../imagens/br-flag.png'
  } else{
    document.querySelector('.flag-language').src = '../../imagens/en-flag.png'
  }  
}

document.getElementById('give-up').addEventListener('click',giveTips)
document.getElementById('give-up').addEventListener('touchstart',giveTips)

document.getElementById('next-flag').addEventListener('click',nextFlag)
document.getElementById('next-flag').addEventListener('touchstart',nextFlag)

document.getElementById('confirm-asnwer').addEventListener('click', Answer.checkCorrectAnswer)
document.getElementById('flag-asnwer').addEventListener('keypress',async ev=>{

  if(ev.key === 'Enter'){
      try{
        if(document.querySelector('#see-results-button')) {
          
          await checkResults()
          
        } else if(document.querySelector('#next-flag.disable')){

          await Answer.checkCorrectAnswer()

        } else {

          await nextFlag(event)
          
        }
      } catch (e) {
  
        alert(e.message)
        
      }
    
  }
})

checkLanguage()
uptadeLanguage()