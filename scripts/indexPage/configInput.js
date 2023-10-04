import { startGame } from "./index.js"

export function addKeybord(){
  let errorMsg = document.getElementById('error-msg')
  let input = document.getElementById('how-many-flags')
  input.addEventListener('keypress',async ev=>{

    ev.preventDefault()

    const allowedKeys = ['1','2','3','4','5','6','7','8','9','0'] 

    if(allowedKeys.includes(ev.key)){
      
      input.value += ev.key

    }

    if(ev.key === 'Backspace'){
      input.value = input.value.slice(0, -1);
    }

    if(input.value.length === 4 || input.value > 250){

      input.value = input.value.slice(0, -1);
      document.querySelector('.button-add-flags-quantity').classList.remove('right')
      
      if(document.querySelector('.container').dataset.currentLanguage === 'pt_BR'){
        errorMsg.textContent = 'O máximo de bandeiras é 250'
      } else{
        errorMsg.textContent = 'The maximum number of flags is 250'
      }
      document.querySelector('.button-add-flags-quantity').classList.add('error')
      return

    } else if (input.value < 10 || input.value === ''){

      document.querySelector('.button-add-flags-quantity').classList.remove('right')
     
      if(document.querySelector('.container').dataset.currentLanguage === 'pt_BR'){
        errorMsg.textContent = 'O mínimo de bandeiras é 10'
      } else{
        errorMsg.textContent = 'The minimum number of flags is 10'
      }
      document.querySelector('.button-add-flags-quantity').classList.add('error')

    } else{

      errorMsg.textContent = ''
      document.querySelector('.button-add-flags-quantity').classList.remove('error')
      document.querySelector('.button-add-flags-quantity').classList.add('right')

    }  
    
    if(ev.key === 'Enter'){
      try{
        await startGame()
        window.location.href = './gamePage.html'
      }catch (e){
        errorMsg.textContent = e.message
      }
    }
  })
}

