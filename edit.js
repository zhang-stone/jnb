document.addEventListener('DOMContentLoaded', () => {
  // 获取URL参数
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const index = urlParams.get('index');
  
  // 设置标题
  document.getElementById('dialogTitle').textContent = mode === 'edit' ? '编辑信息' : '添加信息';
  
  // 如果是编辑模式，加载现有数据
  if (mode === 'edit' && index !== null) {
    chrome.storage.local.get('infoList', (result) => {
      const list = result.infoList || [];
      const info = list[index];
      if (info) {
        document.getElementById('userName').value = info.userName;
        document.getElementById('idCard').value = info.idCard;
        document.getElementById('phone').value = info.phone;
        document.getElementById('appointmentBranch').value = info.appointmentBranch;
        document.getElementById('appointmentQuantity').value = info.appointmentQuantity;
      }
    });
  }
  
  // 保存按钮事件
  document.getElementById('saveInfo').addEventListener('click', () => {
    const info = {
      userName: document.getElementById('userName').value,
      idCard: document.getElementById('idCard').value,
      phone: document.getElementById('phone').value,
      appointmentBranch: document.getElementById('appointmentBranch').value,
      appointmentQuantity: document.getElementById('appointmentQuantity').value
    };
    
    if (!validateInfo(info)) return;
    
    chrome.storage.local.get('infoList', (result) => {
      const list = result.infoList || [];
      
      // 检查重复
      const isDuplicate = list.some((item, idx) => {
        if (mode === 'edit' && idx === parseInt(index)) return false;
        return item.idCard === info.idCard || item.phone === info.phone;
      });
      
      if (isDuplicate) {
        showNotification('该身份证号或手机号已存在！');
        return;
      }
      
      if (mode === 'edit' && index !== null) {
        list[index] = info;
      } else {
        list.push(info);
      }
      
      chrome.storage.local.set({ infoList: list }, () => {
        // 通知主窗口刷新列表
        chrome.runtime.sendMessage({ action: 'refreshList' });
        window.close();
      });
    });
  });
  
  // 取消按钮事件
  document.getElementById('cancelEdit').addEventListener('click', () => {
    window.close();
  });
  
  // 关闭按钮事件
  document.querySelector('.close-btn').addEventListener('click', () => {
    window.close();
  });
});

// 验证信息
function validateInfo(info) {
  if (!info.userName || !info.idCard || !info.phone) {
    showNotification('请填写完整信息！');
    return false;
  }
  
  const idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  if (!idCardReg.test(info.idCard)) {
    showNotification('请输入正确的身份证号码');
    return false;
  }
  
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(info.phone)) {
    showNotification('请输入正确的手机号码');
    return false;
  }
  
  return true;
}

// 显示通知
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
} 