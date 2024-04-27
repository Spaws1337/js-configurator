const fileInput = document.getElementById('fileInput');
const jsonData = { data: null };
const saveButton = document.getElementById('saveButton');
const rsuCheckbox = document.getElementById('ivk_rsu_checkbox');
const rsuInputContainer = document.getElementById('ip_address_rsu').parentNode;
import translit from './translit.js';

function toggleRsuInput() {
    rsuInputContainer.style.display = rsuCheckbox.checked ? 'block' : 'none';
}

function addSaveButtonEventListener() {
  document.getElementById('saveButton').addEventListener('click', function() {
      updateIPAddresses();
      downloadUpdatedJSON();
  });
}


document.addEventListener("DOMContentLoaded", function() {
    rsuCheckbox.addEventListener('change', toggleRsuInput);
    toggleRsuInput();

    const arrowButton = document.getElementById('ivk_osu_arrow');
    arrowButton.addEventListener('click', function() {
        const items = document.querySelectorAll('.configurator__item');
        items.forEach(item => {
            item.style.display = item.style.display === 'none' ? 'block' : 'none';
        });
    });

    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = () => {
              jsonData.data = JSON.parse(reader.result);
              generatePage();
              document.getElementById('file__uploaded').style.display = 'block'; // Показать окошко
          };
          reader.onerror = () => {
              document.getElementById('file__uploaded').style.display = 'none'; // Скрыть окошко
          };
          reader.readAsText(file);
      } else {
          document.getElementById('file__uploaded').style.display = 'none'; // Скрыть окошко
      }
  });
});

function increaseLastOctet(ip) {
  let parts = ip.split('.');
  let lastOctet = parseInt(parts[3]) + 100;
  parts[3] = lastOctet.toString();
  return parts.join('.');
}

function generatePage() {
  const devices = jsonData.data.Devices;
  devices.forEach((device, deviceIndex) => {
      if (deviceIndex === 0) {
          document.getElementById('ip_address_osn').value = device.DBConnectionStrings[0].Server;
      } else if (deviceIndex === 1) {
          document.getElementById('ip_address_rez').value = device.DBConnectionStrings[0].Server;
      } else if (deviceIndex === 2 && device.DBConnectionStrings.length > 0) {
          document.getElementById('ivk_rsu_checkbox').checked = true;
          document.getElementById('ip_address_rsu').value = device.DBConnectionStrings[0].Server;
          toggleRsuInput(); 
      }

      const addDocument = document.querySelector('.configurator__item');
      addDocument.innerHTML = ''; 

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

function updateIPAddresses() {
  const ipOsn = document.getElementById('ip_address_osn').value;
  const ipRez = document.getElementById('ip_address_rez').value;
  const ipRsu = document.getElementById('ip_address_rsu').value;

  if (jsonData.data.Devices[0] && jsonData.data.Devices[0].DBConnectionStrings.length > 1) {
      jsonData.data.Devices[0].DBConnectionStrings[0].Server = ipOsn;
      jsonData.data.Devices[0].DBConnectionStrings[1].Server = increaseLastOctet(ipOsn);
  }
  if (jsonData.data.Devices[1] && jsonData.data.Devices[1].DBConnectionStrings.length > 1) {
      jsonData.data.Devices[1].DBConnectionStrings[0].Server = ipRez;
      jsonData.data.Devices[1].DBConnectionStrings[1].Server = increaseLastOctet(ipRez);
  }
  if (jsonData.data.Devices[2] && jsonData.data.Devices[2].DBConnectionStrings.length > 1) {
      jsonData.data.Devices[2].DBConnectionStrings[0].Server = ipRsu;
      jsonData.data.Devices[2].DBConnectionStrings[1].Server = increaseLastOctet(ipRsu);
  }
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
  for (let i = 0; i < jsonData.data.Devices.length; i++) {
    const device = jsonData.data.Devices[i];
    updateDevice(device);

    if (i > 0) {
      const sourceDevice = jsonData.data.Devices[0];
      copyDeviceState(sourceDevice, device);
    }
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

function copyDeviceState(sourceDevice, targetDevice) {
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

addSaveButtonEventListener();