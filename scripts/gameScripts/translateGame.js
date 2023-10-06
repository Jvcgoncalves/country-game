const gameLanguage = {
  en:{
    asnwer_span: 'Answer:',
    give_up: 'Tips',
    confirm_asnwer: 'Confirm',
    next_flag: 'Next flag',
    flags_to_answer:'Flags',
    see_answer:'See answer'
  },
  pt:{
    asnwer_span: 'Resposta:',
    give_up: 'Dicas',
    confirm_asnwer: 'Confirmar',
    next_flag: 'Próxima bandeira',
    flags_to_answer:'Bandeiras',
    see_answer:'Ver resposta'
  }
}


export async function uptadeLanguage(){
  switch(sessionStorage.getItem('game_language')){
    case 'en_US':
      document.getElementById('asnwer-span').textContent = gameLanguage.en.asnwer_span
      document.getElementById('give-up').textContent = gameLanguage.en.give_up
      document.getElementById('confirm-asnwer').textContent = gameLanguage.en.confirm_asnwer
      document.getElementById('next-flag').textContent = gameLanguage.en.next_flag
      document.getElementById('flags-to-answer').innerHTML = gameLanguage.en.flags_to_answer 

    break;
    case 'pt_BR':
      document.getElementById('asnwer-span').textContent = gameLanguage.pt.asnwer_span
      document.getElementById('give-up').textContent = gameLanguage.pt.give_up
      document.getElementById('confirm-asnwer').textContent = gameLanguage.pt.confirm_asnwer
      document.getElementById('next-flag').textContent = gameLanguage.pt.next_flag
      document.getElementById('flags-to-answer').textContent = gameLanguage.pt.flags_to_answer

    break;
  }

}