const numberDisplay2 = document.getElementById('keyDate2');
let count2 = +numberDisplay2.textContent;

const targetNumber2 = count2; 
const duration2 = 1000; 
const intervalTime2 = 10; 

let start2 = 0;
let currentTime2 = 0;

function animateNumber2() {
  const increment2 = Math.ceil((targetNumber2 - start2) * (intervalTime2 / duration2));

  const updateNumber2 = setInterval(() => {
    currentTime2 += intervalTime2;
    start2 += increment2;

    if (currentTime2 >= duration2) {
      clearInterval(updateNumber2);
      numberDisplay2.textContent = targetNumber2;
    } else {
    numberDisplay2.textContent = start2;
    }
  }, intervalTime2);
}

animateNumber2();
