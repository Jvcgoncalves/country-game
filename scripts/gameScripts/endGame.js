import { correctAnswers } from "./confirmAnswer.js"

export async function endGame(){
  let spans = document.querySelectorAll('.flags-to-answer')  
  if( Number(spans[0].textContent) === Number(spans[1].textContent)){
    document.querySelector('.game-buttons').style.display = 'none'
    const p = document.createElement('p')
    p.textContent = 'Jogo finalizado!'
    p.id = 'end-game-p'

   const seeResults = document.createElement('button')
    seeResults.textContent = 'Ver resultados'
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
  restartButton.textContent = 'Jogar novamente'
  restartButton.id = 'restart-button'
  restartButton.addEventListener('click',()=>{
    window.location.href = '../index.html'
  })
  const percentageOfCorrectAnswers = ((correctAnswers*100)/Number(spans[1].textContent)).toFixed(2)

  if(percentageOfCorrectAnswers >= 80 && percentageOfCorrectAnswers <=100){
    p.textContent = `Parabéns você acertou ${percentageOfCorrectAnswers}% das bandeiras.`
  } else if (percentageOfCorrectAnswers >= 60){
    p.textContent = `Você acertou ${percentageOfCorrectAnswers}% das bandeiras, ta na média.`
  } else if (percentageOfCorrectAnswers >= 40){
    p.textContent = `Você acertou ${percentageOfCorrectAnswers}% das bandeiras, poderia estar pior.`
  } else {
    p.textContent = `Você acertou ${percentageOfCorrectAnswers}% das bandeiras, tem que estudar um pouco mais.`
  }


  contentDiv.append(p,restartButton)
}