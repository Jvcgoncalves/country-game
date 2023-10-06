import { correctAnswers } from "./confirmAnswer.js"
let mainLanguage= ''
const gameLanguage = {
  en:{
    end_game: 'Game finished!',
    see_results:'View results',
    restart_button:'Play again',
    p_content: {
      '80_100': {
        part_1: 'Congratulations you got right',
        part_2: '% of the flags right.'
      },
      '60_80': {
        part_1: 'You got right',
        part_2: '% of the flags right, you got the average.'
      },
      '40_60': {
        part_1: 'You got right',
        part_2: '% of the flags right, could be worse.'
      },
      '<40': {
        part_1: 'You got right',
        part_2: '% of the flags right, you should study more.'
      }
    }
  },
  pt:{
    end_game:'Jogo finalizado!',
    see_results:'Ver resultados',
    restart_button:'Jogar novamente',
    p_content: {
      '80_100': {
        part_1: 'Parabéns você acertou',
        part_2: '% das bandeiras.'
      },
      '60_80': {
        part_1: 'Você acertou',
        part_2: '% das bandeiras, ta na média.'
      },
      '40_60': {
        part_1: 'Você acertou',
        part_2: '% das bandeiras, poderia estar pior.'
      },
      '<40': {
        part_1: 'Você acertou',
        part_2: '% das bandeiras, tem que estudar um pouco mais.'
      }
    }
  }
}

export async function endGame(){
  if(sessionStorage.getItem('game_language') === "pt_BR"){
    mainLanguage = 'pt'
  } else {
    mainLanguage = 'en'
  }

  let spans = document.querySelectorAll('.flags-to-answer')  
  if( Number(spans[0].textContent) === Number(spans[1].textContent)){
    document.querySelector('.game-buttons').style.display = 'none'
    const p = document.createElement('p')
    p.textContent = gameLanguage[mainLanguage].end_game
    p.id = 'end-game-p'

   const seeResults = document.createElement('button')
    seeResults.textContent = gameLanguage[mainLanguage].see_results
    seeResults.id = 'see-results-button'

    seeResults.addEventListener('click',checkResults)

    document.getElementById('content').append(p,seeResults)
  } 
}

export async function checkResults(){
  const contentDiv = document.getElementById('content')

  contentDiv.innerHTML = ''
  let spans = document.querySelectorAll('.flags-to-answer')

  const p = document.createElement('p')
  p.id = 'correct-answer-percent'
  const restartButton = document.createElement('button')
  restartButton.textContent = gameLanguage[mainLanguage].restart_button
  restartButton.id = 'restart-button'
  restartButton.addEventListener('click',()=>{
    window.location.href = '../index.html'
  })
  const percentageOfCorrectAnswers = ((correctAnswers*100)/Number(spans[1].textContent)).toFixed(2)

  if(percentageOfCorrectAnswers >= 80 && percentageOfCorrectAnswers <=100){
    p.textContent = `${gameLanguage[mainLanguage].p_content['80_100'].part_1} ${percentageOfCorrectAnswers}${gameLanguage[mainLanguage].p_content['80_100'].part_2}`
  } else if (percentageOfCorrectAnswers >= 60){
    p.textContent = `${gameLanguage[mainLanguage].p_content['60_80'].part_1} ${percentageOfCorrectAnswers}${gameLanguage[mainLanguage].p_content['60_80'].part_2}`
  } else if (percentageOfCorrectAnswers >= 40){
    p.textContent = `${gameLanguage[mainLanguage].p_content['40_60'].part_1} ${percentageOfCorrectAnswers}${gameLanguage[mainLanguage].p_content['40_60'].part_2}`
  } else {
    p.textContent = `${gameLanguage[mainLanguage].p_content['<40'].part_1} ${percentageOfCorrectAnswers}${gameLanguage[mainLanguage].p_content['<40'].part_2}`
  }


  contentDiv.append(p,restartButton)
}