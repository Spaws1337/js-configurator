const fileInput = document.getElementById('fileInput');

const jsonData = {
  data: null
};

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      // Сохраняем распарсенные данные в jsonData.data
      jsonData.data = JSON.parse(reader.result);
      console.log(jsonData.data); // Выводим данные в консоль
    };
    reader.readAsText(file);
  }
});

const loadButton = document.getElementById('loadButton');

function processJsonData() {
  if (jsonData.data) {
    // Здесь вы можете обрабатывать данные JSON
    console.log('Обработка данных JSON:', jsonData.data);
  } else {
    console.log('Данные JSON еще не загружены');
  }
}

loadButton.addEventListener('click', (e) => {
  processJsonData();
});