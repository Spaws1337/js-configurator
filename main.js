const fileInput = document.getElementById('fileInput');
const jsonData = { data: null };
const saveButton = document.getElementById('saveButton');
import translit from "./translit.js";


document.addEventListener("DOMContentLoaded", function() {
  const arrowButton = document.getElementById('ivk_osu_arrow');
  if (arrowButton) {
      arrowButton.addEventListener('click', function() {
          const items = document.querySelectorAll('.configurator__item');
          items.forEach(item => {
              if (item.style.display === 'none') {
                  item.style.display = 'block'; // Если элемент скрыт, показываем его (можно указать 'block', если это необходимо)
              } else {
                  item.style.display = 'none'; // Если элемент видим, скрываем его
              }
          });
      });
  }
});


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
  jsonData.data.Devices.forEach((device, deviceIndex) => {
    const addDocument = document.querySelector('.configurator__item');
    addDocument.innerHTML = ''; // Очищаем существующий HTML

    device.Docs.forEach(doc => {
      let templateDocsHTML = generateTemplateDocsHTML(doc.TemplateDocs, translit(doc.Name));
      const checkBoxId = `checkBox_${translit(doc.Name)}`;
      const docHtml = `
        <div class="item__props_${translit(doc.Name)}">
          <div class="custom-checkbox">
            <input type="checkbox" id="${checkBoxId}" name="checkBoxArrow_${translit(doc.Name)}" ${doc.Use ? 'checked' : ''}/>
            <label for="${checkBoxId}">
              <h2>${doc.Name}</h2>
              <span class="checkbox-icon"></span>
            </label>
          </div>
          <div class="${translit(doc.Name)}">
            ${templateDocsHTML}
          </div>
        </div>
      `;
      addDocument.innerHTML += docHtml;
    });
  });
}

function generateTemplateDocsHTML(templateDocs, parentName) {
  let templateDocsHTML = '';
  if (Array.isArray(templateDocs)) {
    templateDocs.forEach(doc => {
      const docId = `checkBoxDocs_${translit(parentName)}_${translit(doc.Name)}`;
      templateDocsHTML += `
        <div class="custom-checkbox">
          <input type="checkbox" id="${docId}" name="${translit(doc.Name)}" ${doc.Use ? 'checked' : ''}/>
          <label for="${docId}">
            <h3 title="${doc.Description}">${doc.Name}</h3>
            <span class="checkbox-icon"></span>
          </label>
        </div>
      `;
      if (doc.TemplateDocs) {
        templateDocsHTML += generateTemplateDocsHTML(doc.TemplateDocs, `${parentName}${doc.Name}`);
      }
    });
  }
  return templateDocsHTML;
}

function updateMultipleDevices() {
  updateDevice(jsonData.data.Devices[0]); // Обновляем device[0]
  if (jsonData.data.Devices[1]) {
    copyDeviceState(0, 1); // Копируем состояние с device[0] на device[1]
  }
  if (document.getElementById('ivk_rsu_checkbox')?.checked && jsonData.data.Devices[2]) {
    copyDeviceState(0, 2); // Копируем состояние на device[2], если чекбокс активен
  }
}

function updateDevice(device) {
  device.Docs.forEach(doc => {
    const docCheckboxId = `checkBox_${translit(doc.Name)}`;
    const docCheckbox = document.getElementById(docCheckboxId);
    if (docCheckbox) {
      doc.Use = docCheckbox.checked;
    }
    if (doc.TemplateDocs) {
      updateTemplateDocs(doc.TemplateDocs, translit(doc.Name));
    }
  });
}

function updateTemplateDocs(templateDocs, parentName) {
  templateDocs.forEach(doc => {
    const subDocCheckboxId = `checkBoxDocs_${parentName}_${translit(doc.Name)}`;
    const subDocCheckbox = document.getElementById(subDocCheckboxId);
    if (subDocCheckbox) {
      doc.Use = subDocCheckbox.checked;
    }
    if (doc.TemplateDocs) {
      updateTemplateDocs(doc.TemplateDocs, `${parentName}${doc.Name}`);
    }
  });
}

function copyDeviceState(sourceIndex, targetIndex) {
  let sourceDevice = jsonData.data.Devices[sourceIndex];
  let targetDevice = jsonData.data.Devices[targetIndex];
  targetDevice.Docs.forEach((doc, docIndex) => {
    doc.Use = sourceDevice.Docs[docIndex].Use;
    if (doc.TemplateDocs) {
      copyTemplateDocsState(sourceDevice.Docs[docIndex].TemplateDocs, doc.TemplateDocs);
    }
  });
}

function copyTemplateDocsState(sourceTemplateDocs, targetTemplateDocs) {
  targetTemplateDocs.forEach((doc, docIndex) => {
    doc.Use = sourceTemplateDocs[docIndex].Use;
    if (doc.TemplateDocs) {
      copyTemplateDocsState(sourceTemplateDocs[docIndex].TemplateDocs, doc.TemplateDocs);
    }
  });
}

function downloadUpdatedJSON() {
  updateMultipleDevices();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData.data));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "CfgApp.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

saveButton.addEventListener('click', downloadUpdatedJSON);
