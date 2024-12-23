// 监听扩展图标点击事件
chrome.action.onClicked.addListener(() => {
  // 检查是否已经打开了窗口
  chrome.windows.getAll({ populate: true }, (windows) => {
    const existingWindow = windows.find(w => 
      w.type === 'popup' && 
      w.tabs && 
      w.tabs[0] && 
      w.tabs[0].url && 
      w.tabs[0].url.includes('popup.html')
    );

    if (existingWindow) {
      // 如果窗口已存在，则聚焦它
      chrome.windows.update(existingWindow.id, { 
        focused: true,
        drawAttention: true
      });
    } else {
      // 创建新窗口
      chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 250,
        height: 350,
        focused: true
      });
    }
  });
}); 