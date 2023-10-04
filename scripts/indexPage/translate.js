let currentLanguage = document.querySelector('.container')

const gameLanguage = {
  en:{
    how_many_flags_question: 'Choose how many flags you want to play with',
    submit_flags_quantity: 'Start'
  },
  pt:{
    how_many_flags_question: 'Escolha com quantas bandeiras deseja jogar',
    submit_flags_quantity: 'Iniciar'
  }
}

export async function downLanguageSelector(event){ // Seletor de idioma 
  
  if(event.type==='touchstart') event.preventDefault()
  document.getElementById('available-lng').classList.toggle('active')
  if(document.querySelector('#available-lng.active')){
    document.getElementById('down-arrow').style.rotate = '-180deg'
  } else {
    document.getElementById('down-arrow').style.rotate = '0deg'
  }
  
} 
document.querySelectorAll('.languages').forEach(ev=>{
  ev.addEventListener('click',changeLanguage)
  ev.addEventListener('touchstart',changeLanguage)
})

export async function changeLanguage(ev){ // Troca de idioma do jogo 
  if(ev.type==='touchstart') ev.preventDefault()

  document.querySelector('#selected').id = ''
  currentLanguage.dataset.currentLanguage = ev.currentTarget.dataset.language 

  ev.currentTarget.id = 'selected'
  document.getElementById('available-lng').classList.toggle('active')

  document.querySelector('.flag-language').src = ev.currentTarget.childNodes[1].src

  changeDocumentElements()
}

export async function changeDocumentElements(){
  switch(currentLanguage.dataset.currentLanguage){
    case 'en_US':
      document.getElementById('how-many-flags-question').textContent = gameLanguage.en.how_many_flags_question
      document.getElementById('submit-flags-quantity').textContent = gameLanguage.en.submit_flags_quantity
    break;
    case 'pt_BR':
      document.getElementById('how-many-flags-question').textContent = gameLanguage.pt.how_many_flags_question
      document.getElementById('submit-flags-quantity').textContent = gameLanguage.pt.submit_flags_quantity
    break;
  }
}