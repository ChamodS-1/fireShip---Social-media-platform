const numberDisplay = document.getElementById('keyDate');
let count = +numberDisplay.textContent;

const targetNumber = count; 
const duration = 1000; 
const intervalTime = 10; 

let start = 0;
let currentTime = 0;

function animateNumber() {
  const increment = Math.ceil((targetNumber - start) * (intervalTime / duration));

  const updateNumber = setInterval(() => {
    currentTime += intervalTime;
    start += increment;

    if (currentTime >= duration) {
      clearInterval(updateNumber);
      numberDisplay.textContent = targetNumber;
    } else {
    numberDisplay.textContent = start;
    }
  }, intervalTime);
}

animateNumber();
