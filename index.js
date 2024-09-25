const symbols = ["🍒", "🍋", "🍊", "🍉", "🍇", "👽"];
const spinButton = document.querySelector('#spinButton');
const resultDiv = document.querySelector('.result');
const coinDisplayElement = document.querySelector('.coinDisplay');
const coinCountElement = document.querySelector('.coinCount');
const toggleButton = document.querySelector('#toggleButton');
const reel1Symbol = document.querySelector('#reel1 .symbol');
const reel2Symbol = document.querySelector('#reel2 .symbol');
const reel3Symbol = document.querySelector('#reel3 .symbol');
const bgmToggle = document.querySelector('#bgmToggle');
const sfxToggle = document.querySelector('#sfxToggle');
const volumeTexts = document.querySelectorAll('.volumeText');
const bgmVolumeControl = document.getElementById('bgmVolumeControl');
const sfxVolumeControl = document.getElementById('sfxVolumeControl');
const bgm = new Audio('audio/music.mp3');
const reelSFX = new Audio('audio/reel.mp3');

let coins = 50; // 초기 코인 수
let isWhiteMode = false; // 모드 상태
var bgmVolume = 1;
let sfxVolume = 1;
let toggleSFX = false;

function detectMobileDevice() {
    const minWidth = 700;
  
    return window.innerWidth <= minWidth;
  }
  
  const isMobile = detectMobileDevice();

// 페이지 로드 시 랜덤 심볼로 리엘 채우기
window.onload = () => {
    if (isMobile) {
        document.body.querySelector('.main').classList.add('mobile');
    }
    fillReels();
    loadUserSetting();
    bgm.loop = true;
};

function loadUserSetting(){

    //coin
    coins = localStorage.getItem('coins');
    if(coins <= 0) coins = 50;
    updateCoinDisplay();

    //bgm
    bgmVolume = localStorage.getItem('bgmVolume');
    bgm.volume = bgmVolume;
    bgmVolumeControl.value = bgmVolume;

    //sfx
    sfxVolume = localStorage.getItem('sfxVolume');
    reelSFX.volume = sfxVolume;
    sfxVolumeControl.value = sfxVolume;
}

function toggleMode() {
    document.body.classList.toggle('white-mode');
    const isWhiteMode = document.body.classList.contains('white-mode');
    document.querySelector('.container').classList.toggle('white-mode');
    resultDiv.classList.toggle('white-mode');
    coinDisplayElement.classList.toggle('white-mode');
    coinCountElement.classList.toggle('white-mode');
    volumeTexts.forEach(volumeText => {
        volumeText.classList.toggle('white-mode');
    });
    
    // 모드에 따라 버튼 이모지 변경
    toggleButton.textContent = isWhiteMode ? '🌞' : '🌙'; // 화이트 모드: 태양, 다크 모드: 달
}

// 버튼 클릭 시 toggleMode 호출
toggleButton.addEventListener('click', toggleMode);

bgmToggle.addEventListener('click', ()=>{
    if (bgmToggle.checked) {
        bgm.play();
    } else {
        bgm.pause();
    }
});

sfxToggle.addEventListener('click', ()=>{
    toggleSFX = sfxToggle.checked;
});


bgmVolumeControl.addEventListener('input', () => {
    bgmVolume = bgmVolumeControl.value;
    localStorage.setItem('bgmVolume', bgmVolume);
    bgm.volume = bgmVolume;
});
sfxVolumeControl.addEventListener('input', () => {
    sfxVolume = sfxVolumeControl.value;
    localStorage.setItem('sfxVolume', sfxVolume);
    reelSFX.volume = sfxVolume;
});

spinButton.addEventListener('click', () => {
    coins = localStorage.getItem('coins');
    if (coins <= 0) {
        resultDiv.innerHTML = "코인이 부족합니다! <br>새로고침 시 무료 50코인 지급";
        return; // 코인이 없으면 스핀하지 않음
    }

    // 코인 차감
    coins--;
    updateCoinDisplay();

    // 버튼 비활성화
    spinButton.disabled = true;

    // 효과음 재생
    reelSFX.currentTime = 0;
    if(toggleSFX)
        reelSFX.play();
    const clickSFX = new Audio('audio/click.mp3');
    clickSFX.volume = sfxVolume;
    clickSFX.pitch = 3;
    clickSFX.playbackRate = 3;

    // 애니메이션 시작
    [reel1Symbol, reel2Symbol, reel3Symbol].forEach(symbol => symbol.classList.add('spin'));

    // 심볼 변경 함수
    const changeSymbolInterval = (reelSymbol) => {
        return setInterval(() => {
            let newSymbol;
            do{
                newSymbol = getRandomSymbol();
            }while(reelSymbol.textContent === newSymbol)
            reelSymbol.textContent = newSymbol;
        }, 200);
    };

    // 인터벌 설정
    const reelIntervals = [
        changeSymbolInterval(reel1Symbol),
        changeSymbolInterval(reel2Symbol),
        changeSymbolInterval(reel3Symbol)
    ];

    // 슬롯 멈추는 함수
    const stopReel = (index, delay) => {
        setTimeout(() => {
            clearInterval(reelIntervals[index]);
        }, delay - 100);
        setTimeout(() => {
            const symbol = [reel1Symbol, reel2Symbol, reel3Symbol][index];
            symbol.classList.remove('spin');
            clickSFX.currentTime = 0; // 클릭 효과음 초기화
            if(toggleSFX)
                clickSFX.play(); // 클릭 소리 재생
        }, delay);
    };

    // 슬롯 멈춤 설정
    stopReel(0, 1000); // 첫 번째 슬롯
    stopReel(1, 1400); // 두 번째 슬롯
    stopReel(2, 1800); // 세 번째 슬롯

    // 결과 체크
    setTimeout(() => {
        const results = [reel1Symbol.textContent, reel2Symbol.textContent, reel3Symbol.textContent];
        checkResult(...results);

        reelSFX.pause();
        if(toggleSFX){
            const bellSFX = new Audio('audio/bell.mp3');
            bellSFX.volume = sfxVolume * 0.06;
            bellSFX.play();
        }
    }, 1800); // 결과 체크는 1800ms 후에 수행
});

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function fillReels() {
    reel1Symbol.textContent = '🍒';
    reel2Symbol.textContent = '🍒';
    reel3Symbol.textContent = '🍒';
}

function createFallingMoney() {
    const moneyEmojis = ["💰", "💵", "💸", "🪙", "💳"]; // 사용할 돈 관련 이모지 배열
    const moneyCount = 30; // 떨어뜨릴 이모지 개수
    const delay = 100; // 이모지 생성 간격 (ms)

    for (let i = 0; i < moneyCount; i++) {
        setTimeout(() => {
            const money = document.createElement('div');
            money.classList.add('money');
            money.textContent = moneyEmojis[Math.floor(Math.random() * moneyEmojis.length)];

            // 랜덤 위치 설정 (화면 너비 내에서)
            const leftPosition = Math.random() * (window.innerWidth - 150); // 이모지의 너비를 고려하여 50px 제외
            money.style.left = `${leftPosition}px`;
            money.style.top = `${Math.random() * -100}px`; // 위에서 떨어지기 시작

            document.body.appendChild(money);

            // 애니메이션 끝난 후 이모지 제거
            money.addEventListener('animationend', () => {
                money.remove();
            });
        }, i * delay); // 순차적으로 생성
    }
}

function checkResult(symbol1, symbol2, symbol3) {
    if (symbol1 === symbol2 && symbol2 === symbol3) {
        resultDiv.textContent = "축하합니다! 잭팟!";
        if(toggleSFX){
            var jackpotCoinSFX = new Audio('audio/jackpot.mp3');
            var jackpotViolinSFX = new Audio('audio/jackpot-violin.mp3');
            jackpotCoinSFX.volume = sfxVolume * 0.5;
            jackpotViolinSFX.volume = sfxVolume * 0.5;
            jackpotCoinSFX.play();
            jackpotViolinSFX.play();
        }

        coins += 100; // 잭팟 시 코인 추가
        updateCoinDisplay();

        // 심볼에 애니메이션 클래스 추가
        const symbols = [reel1Symbol, reel2Symbol, reel3Symbol];
        symbols.forEach(symbol => {
            symbol.classList.add('jackpot'); // 애니메이션 클래스 추가
            
            // 애니메이션 종료 시 클래스 제거
            symbol.addEventListener('animationend', () => {
                symbol.classList.remove('jackpot');
                spinButton.disabled = false;
            });
        });
        
        createFallingMoney();
    } else {
        resultDiv.textContent = "다시 시도해보세요!";
        spinButton.disabled = false;
    }
}


function updateCoinDisplay() {
    coinCountElement.textContent = coins; // 코인 수 업데이트
    localStorage.setItem('coins', coins);
}
