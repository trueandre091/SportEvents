document.addEventListener('DOMContentLoaded', () => {
  const filterButton = document.querySelector('.filter-button');
  const filterFormContainer = document.querySelector('.filter-form-container');
  const filterForm = document.querySelector('.filter-form');
  
  filterButton.addEventListener('click', () => {
    filterFormContainer.classList.toggle('active');
    
    if (filterFormContainer.classList.contains('active')) {
      const formHeight = filterForm.offsetHeight;
      document.documentElement.style.setProperty('--form-height', `${formHeight}px`);
    } else {
      document.documentElement.style.setProperty('--form-height', '0');
    }
  });
  
  // Обработка формы
  const resetButton = document.querySelector('.filter-reset');
  
  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Здесь добавьте логику обработки фильтров
    filterFormContainer.classList.remove('active');
  });
  
  resetButton.addEventListener('click', () => {
    filterForm.reset();
  });
});

function addDatesToSquares() {
    // Получаем текущу дату
    const currentDate = new Date();
    
    // Получаем все квадраты
    const squares = document.querySelectorAll('.rounded-square');
    
    // Получаем текущий масштаб
    const scale = document.documentElement.clientWidth / 1920;
    
    squares.forEach((square, index) => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + index);
        
        // Сохраняем полную дату как атрибут кнопки
        square.setAttribute('data-full-date', date.toISOString());
        
        const day = date.getDate().toString().padStart(2, '0');
        
        const dateElement = document.createElement('div');
        dateElement.className = 'square-date';
        dateElement.textContent = day;
        
        const backgroundColor = window.getComputedStyle(square).backgroundColor;
        const whiteAndBlueBackgrounds = [
            'rgb(48, 126, 242)',
            'rgb(255, 255, 255)'
        ];
        
        dateElement.style.color = whiteAndBlueBackgrounds.includes(backgroundColor) ? '#000000' : '#FFFFFF';
        dateElement.style.setProperty('--scale', scale);
        
        square.appendChild(dateElement);
        
        // Добавляем обаботчик клика
        square.addEventListener('click', function() {
            const fullDate = new Date(this.getAttribute('data-full-date'));
            const months = [
                'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
            ];
            
            const formattedDate = `${fullDate.getDate()} ${months[fullDate.getMonth()]} ${fullDate.getFullYear()}`;
            console.log(formattedDate); // Выводим в консоль для проверки
            
            window.location.href = `/events?date=${fullDate.toISOString().split('T')[0]}&all=true`;
        });
    });
  }

function createEventSlide(event) {
    console.log('Creating slide for event:', event);
    console.log('Event ID:', event.id);
    
    const slide = document.createElement('div');
    slide.className = 'slider-item';
    
    const startDate = new Date(event.date_start);
    const endDate = new Date(event.date_end);
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    const [location, ...venueParts] = event.place.split(',');
    const venue = venueParts.join(',').trim();
    
    slide.innerHTML = `
        <div class="slider-dates">
            <div class="slider-days">${startDate.getDate()}${endDate ? '-' + endDate.getDate() : ''}</div>
            <div class="slider-month">${months[startDate.getMonth()]}</div>
        </div>
        <h2 class="slider-sport">${event.sport}<br></h2>
        <h3 class="slider-title">${event.title}</h3>
        <div class="slider-location">
            ${location}<br>${venue}
        </div>
    `;
    
    slide.addEventListener('click', () => {
        console.log('Clicked event:', event);
        console.log('Navigating to:', `/events/${event.event_id}`);
        window.location.href = `/events/${event.event_id}`;
    });
    
    slide.style.cursor = 'pointer';
    
    return slide;
}

function initSlider() {
    const track = document.querySelector('.slider-track');
    const prevButton = document.querySelector('.slider-button.prev');
    const nextButton = document.querySelector('.slider-button.next');
    
    if (!track || !window.randomEvents) {
        console.error('Required elements not found');
        return;
    }

    // Определяем количество видимых слайдов в зависимости от ширины экрана
    function getSlidesToShow() {
        if (window.innerWidth <= 576) return 1;
        if (window.innerWidth <= 992) return 2;
        if (window.innerWidth <= 1200) return 3;
        return 4;
    }

    let slidesToShow = getSlidesToShow();
    const slideWidth = window.innerWidth <= 576 ? 
        track.offsetWidth : 
        track.offsetWidth / slidesToShow;

    // Очищаем трек
    track.innerHTML = '';
    
    // Создаем слайды
    window.randomEvents.forEach(event => {
        const slide = createEventSlide(event);
        track.appendChild(slide);
    });

    const slides = Array.from(track.children);
    const slidesToClone = slidesToShow;
    
    // Клонируем слайды для бесконечной прокрутки
    for (let i = slides.length - 1; i >= Math.max(0, slides.length - slidesToClone); i--) {
        const clone = slides[i].cloneNode(true);
        track.insertBefore(clone, track.firstChild);
    }

    for (let i = 0; i < slidesToClone; i++) {
        const clone = slides[i].cloneNode(true);
        track.appendChild(clone);
    }

    let currentIndex = slidesToClone;
    let position = -currentIndex * slideWidth;
    track.style.transform = `translateX(${position}px)`;

    // Обновляем размеры при изменении окна
    window.addEventListener('resize', () => {
        slidesToShow = getSlidesToShow();
        const newSlideWidth = window.innerWidth <= 576 ? 
            track.offsetWidth : 
            track.offsetWidth / slidesToShow;
        position = -currentIndex * newSlideWidth;
        track.style.transform = `translateX(${position}px)`;
    });

    function slide(direction) {
        if (track.style.transition !== 'transform 0.5s ease-in-out') {
            track.style.transition = 'transform 0.5s ease-in-out';
        }
        
        currentIndex += direction;
        position = -currentIndex * slideWidth;
        track.style.transform = `translateX(${position}px)`;
    }

    function resetPosition() {
        const totalSlides = track.children.length;
        
        // Если достигли конца
        if (currentIndex >= totalSlides - slidesToClone) {
            track.style.transition = 'none';
            currentIndex = slidesToClone;
            position = -currentIndex * slideWidth;
            track.style.transform = `translateX(${position}px)`;
        }
        // Если достигли начала
        else if (currentIndex < slidesToClone) {
            track.style.transition = 'none';
            currentIndex = totalSlides - slidesToClone * 2;
            position = -currentIndex * slideWidth;
            track.style.transform = `translateX(${position}px)`;
        }
        
        setTimeout(() => {
            track.style.transition = 'transform 0.5s ease-in-out';
        }, 50);
    }

    nextButton.addEventListener('click', () => {
        slide(1);
    });

    prevButton.addEventListener('click', () => {
        slide(-1);
    });

    track.addEventListener('transitionend', resetPosition);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initSlider);
