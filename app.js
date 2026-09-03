const toast = document.querySelector('#toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

async function copyText(text, message = '已复制') {
  await navigator.clipboard.writeText(text);
  showToast(message);
}

function absoluteUrl(path) {
  return new URL(path.replace(/^\/+/, ''), window.location.href).href;
}

async function copyRichArticle() {
  const source = document.querySelector('#wechat-article');
  const clone = source.cloneNode(true);
  clone.querySelectorAll('img').forEach((image) => {
    image.setAttribute('src', absoluteUrl(image.getAttribute('src')));
  });

  const html = clone.innerHTML;
  const text = source.innerText;

  try {
    if (!window.ClipboardItem) throw new Error('ClipboardItem unavailable');
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ]);
    showToast('整篇图文已复制，可粘贴到公众号后台');
  } catch {
    const range = document.createRange();
    range.selectNodeContents(source);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    const ok = document.execCommand('copy');
    selection.removeAllRanges();
    showToast(ok ? '整篇图文已复制' : '请手动选择正文复制');
  }
}

document.querySelectorAll('[data-copy-rich]').forEach((button) => {
  button.addEventListener('click', copyRichArticle);
});
document.querySelectorAll('[data-copy-text]').forEach((button) => {
  button.addEventListener('click', async () => {
    const target = document.querySelector(button.dataset.copyText);
    await copyText(target.textContent.trim());
  });
});
document.querySelectorAll('[data-copy-url]').forEach((button) => {
  button.addEventListener('click', async () => {
    await copyText(absoluteUrl(button.dataset.copyUrl), '图片在线地址已复制');
  });
});
