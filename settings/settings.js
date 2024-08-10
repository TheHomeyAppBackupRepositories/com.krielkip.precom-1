function displayLogs(lines) {
  document.getElementById('log').innerHTML = lines;
}

function updateLogs() {
  try {
    displayLogs('');
    Homey.api('GET', 'getlogs/', null, (err, result) => {
      if (!err) {
        let lines = '';
        result
          .reverse()
          .forEach((line) => {
            const logLine = line
              .replace(' [ManagerDrivers]', '')
              .replace(/\[Device:(.*?)\]/, '[dev]')
              .replace(/\[Driver:(.*?)\]/, '[$1]')
              .replace(' [log] ', '')
              .replace(' [App] ', '')
              .replace(' [attached_device]', '');
            lines += `${logLine}<br />`;
          });
        displayLogs(lines);
      } else {
        displayLogs(err);
      }
    });
  } catch (e) {
    displayLogs(e);
  }
}

function deleteLogs() {
  Homey.confirm(Homey.__('settings.deleteWarning'), 'warning', (error, result) => {
    if (result) {
      Homey.api('GET', 'deletelogs/', null, (err) => {
        if (err) {
          Homey.alert(err.message, 'error'); // [, String icon], Function callback )
        } else {
          Homey.alert(Homey.__('settings.deleted'), 'info');
          updateLogs();
        }
      });
    }
  });
}

function onHomeyReady(Homey) {

  let webhookElement = document.getElementById('webhook'),
    logElement = document.getElementById('log');

  Homey.api('get', '/', null, function(err, result) {
    if (err) return Homey.alert(err);
    webhookElement.value = result;
  });
  updateLogs();
  // Tell Homey we're ready to be displayed
  Homey.ready();
}
