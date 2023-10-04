export function changeNumbers(){
  const howManyFlags = document.getElementById('how-many-flags')
  function clickToAddOrSub(item){

    if( item.type==='touchstart') item.preventDefault()
    
    if(item.currentTarget.id === 'plus-span' && howManyFlags.value < 250) {

      howManyFlags.value++

    } else if(item.currentTarget.id === 'dash-span' && howManyFlags.value > 0 ){

      howManyFlags.value--

    }
  }
  document.querySelectorAll('div[class="button-add-flags-quantity"] > span').forEach(span=>{
    span.addEventListener('click', item=>{

      clickToAddOrSub(item)

    })
  })
  document.querySelectorAll('div[class="button-add-flags-quantity"] > span').forEach(span=>{
    span.addEventListener('touchstart', item=>{

      clickToAddOrSub(item)
      
    })
  })
} 