
const currentUrlInput = document.getElementById('currentUrl');
const urlInput = document.getElementById('urlInput');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

window.electronAPI.receive('current-url', (event, currentUrl) => {
  currentUrlInput.value = currentUrl;
});

console.log('before addEventListener')
saveBtn.addEventListener('click', () => {
  const newUrl = urlInput.value;

  // 简单的URL格式检查
  if (newUrl.trim() === '') {
    alert('URL不能为空');
    return;
  }
  // 简单的URL格式检查
  if (!isValidUrl(newUrl)) {
    alert('URL格式不正确');
    return;
  }
  // 发送保存消息给主进程
  window.electronAPI.send('save-url', newUrl);    

});

cancelBtn.addEventListener('click', () => {
  window.electronAPI.send('cancel');
});


function isValidUrl(url) {
    return url.match(/^https?:\/\/[^\s/$.?#].[^\s]*$/);
}