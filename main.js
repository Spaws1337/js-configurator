const fileInput = document.getElementById('fileInput');
const jsonData = { data: null };
import translit from "./translit.js";

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      jsonData.data = JSON.parse(reader.result);
      generatePage();
    };
    reader.readAsText(file);
  }
});

function generatePage() {
  if (jsonData.data && jsonData.data.Devices && jsonData.data.Devices.length > 0) {
    const device = jsonData.data.Devices[0];
    const addDocument = document.querySelector('.configurator__item');
    addDocument.innerHTML = '';

    if (device.Docs) {
      device.Docs.forEach(doc => {
        let templateDocsHTML = '';

        function generateTemplateDocsHTML(templateDocs, parentName) {
          if (Array.isArray(templateDocs)) {
            templateDocs.forEach(doc => {
              if (doc.Name) {
                templateDocsHTML += `
                  <div class="custom-checkbox">
                    <input type="checkbox" id="checkBoxDocs_${translit(parentName)}_${translit(doc.Name)}" name="${translit(doc.Name)}" ${doc.Use ? 'checked' : ''}/>
                    <label for="checkBoxDocs_${translit(parentName)}_${translit(doc.Name)}">
                      <h3 title="${doc.Description}">${doc.Name}</h3>
                      <span class="checkbox-icon"></span>
                    </label>
                  </div>
                `;
              }
              if (doc.TemplateDocs) {
                generateTemplateDocsHTML(doc.TemplateDocs, `${parentName}${doc.Name}`);
              }
            });
          }
        }

        generateTemplateDocsHTML(doc.TemplateDocs, translit(doc.Name));

        const docHtml = `
          <div class="item__props_${translit(doc.Name)}">
            <div class="custom-checkbox">
              <input type="checkbox" id="checkBoxArrow_${translit(doc.Name)}" name="checkBoxArrow_${translit(doc.Name)}" />
              <label for="checkBoxArrow_${translit(doc.Name)}">
                <h2>${doc.Name}</h2>
                <span class="arrow-icon"></span>
              </label>
              <div class="custom-checkbox">
                <input type="checkbox" id="checkBox_${translit(doc.Name)}" name="checkBox_${translit(doc.Name)}" ${doc.Use ? 'checked' : ''}/>
                <label for="checkBox_${translit(doc.Name)}">
                  <span class="checkbox-icon"></span>
                </label>
              </div>
            </div>
            <div class="${translit(doc.Name)}">
              ${templateDocsHTML}
            </div>
          </div>
        `;
        addDocument.innerHTML += docHtml;

        const checkBoxDocInputs = document.querySelectorAll('input[type="checkbox"][id^="checkBox"]');
        checkBoxDocInputs.forEach(input => {
          input.addEventListener('change', () => {
            console.log(`Чекбокс ${input.id} изменился на ${input.checked}`);
            // Здесь можно добавить дополнительную логику при изменении состояния чекбокса
          });
        });
      });
    }
  }
}