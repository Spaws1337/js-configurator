const fileInput = document.getElementById('fileInput');
const jsonData = { data: null };
const saveButton = document.getElementById('saveButton');
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
      });
    }
  }
}

// Function to update the JSON data based on the checkboxes
function updateJSONData() {
  if (jsonData.data && jsonData.data.Devices && jsonData.data.Devices.length > 0) {
    const device = jsonData.data.Devices[0];
    if (device.Docs) {
      device.Docs.forEach(doc => {
        const checkbox = document.getElementById(`checkBox_${translit(doc.Name)}`);
        if (checkbox) {
          doc.Use = checkbox.checked;
        }

        if (doc.TemplateDocs) {
          updateTemplateDocs(doc.TemplateDocs, translit(doc.Name));
        }
      });
    }
  }
}

// Helper function to update TemplateDocs
function updateTemplateDocs(templateDocs, parentName) {
  templateDocs.forEach(doc => {
    const checkbox = document.getElementById(`checkBoxDocs_${parentName}_${translit(doc.Name)}`);
    if (checkbox) {
      doc.Use = checkbox.checked;
    }
    if (doc.TemplateDocs) {
      updateTemplateDocs(doc.TemplateDocs, `${parentName}${translit(doc.Name)}`);
    }
  });
}

// Function to trigger the download of the updated JSON file
function downloadUpdatedJSON() {
  updateJSONData();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "updated_data.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

saveButton.addEventListener('click', downloadUpdatedJSON);
