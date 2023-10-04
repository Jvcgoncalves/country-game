import { addKeybord } from "./configInput.js"
import { changeNumbers } from "./numberChange.js"
import { changeDocumentElements, downLanguageSelector } from "./translate.js"

addKeybord()
changeNumbers()
changeDocumentElements()

document.getElementById('current-language').addEventListener('click',downLanguageSelector)
document.getElementById('current-language').addEventListener('touchstart',downLanguageSelector)

export async function startGame(){
  
  const flags_quantity = parseInt(document.getElementById('how-many-flags').value)

  if(isNaN(flags_quantity) && document.querySelector('.container').dataset.currentLanguage === 'pt_BR'){
    throw new Error('Precisa ser um valor numérico de 1 até 250')
  } else if(isNaN(flags_quantity) ){
    console.log(typeof flags_quantity)
    console.log( flags_quantity)

    throw new Error('Must be a numeric value from 1 to 250')
  }

  if(flags_quantity.length > 3 || flags_quantity > 250){

    document.querySelector('.button-add-flags-quantity').classList.remove('right')
    document.querySelector('.button-add-flags-quantity').classList.add('error')
    
    if(document.querySelector('.container').dataset.currentLanguage === 'pt_BR'){
        throw new Error('O número maximo de bandeiras é 250')
      } else{
        throw new Error('The maximum number of flags is 250')
      }
  } else if (flags_quantity < 10 || flags_quantity === ''){

    document.querySelector('.button-add-flags-quantity').classList.remove('right')
    document.querySelector('.button-add-flags-quantity').classList.add('error')
    
    if(document.querySelector('.container').dataset.currentLanguage === 'pt_BR'){
        throw new Error('O mínimo de bandeiras é 10')
      } else{
        throw new Error('The minimum number of flags is 10')
      }
  }
  
  sessionStorage.setItem('flags_quantity',flags_quantity)
}

document.getElementById('submit-flags-quantity').addEventListener('click', async () =>{
  try{

   await startGame()

   sessionStorage.setItem('game_language', document.querySelector('.container').dataset.currentLanguage)

   window.location.href = './gamePage.html'
   
  }catch (e){

    document.getElementById('error-msg').textContent = e.message

  }
})

document.getElementById('submit-flags-quantity').addEventListener('touchstart', async () =>{
  try{

    await startGame()
    window.location.href = './gamePage.html'
  }catch (e){

    document.getElementById('error-msg').textContent = e.message

  }
})