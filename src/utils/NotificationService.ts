export class NotificationService {
  private hasPermission = false;
  private audioContext: AudioContext | null = null;
  
  constructor() {
    this.initializeNotifications();
  }
  
  private async initializeNotifications() {
    // Запрос разрешения на уведомления
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        this.hasPermission = permission === 'granted';
      } else {
        this.hasPermission = Notification.permission === 'granted';
      }
    }
    
    // Инициализация аудио контекста для звуковых сигналов
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext not supported', e);
    }
  }
  
  async showNotification(title: string, options: {
    body?: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: { action: string; title: string }[];
  } = {}) {
    if (!this.hasPermission || !('Notification' in window)) {
      console.warn('Notifications not supported or permission denied');
      return null;
    }
    
    const notification = new Notification(title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      tag: options.tag || 'fimea-alert',
      requireInteraction: options.requireInteraction || false,
      badge: '/favicon.ico',
      ...options
    });
    
    // Автоматически закрываем через 10 секунд если не критичная
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
    
    return notification;
  }
  
  playAlertSound(type: 'info' | 'warning' | 'critical' = 'warning', duration: number = 200) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Настройки звука в зависимости от типа
    switch (type) {
      case 'info':
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        break;
      case 'warning':
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + duration / 1000);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        break;
      case 'critical':
        // Тревожный звук - несколько тонов
        const freq1 = 800;
        const freq2 = 1200;
        oscillator.frequency.setValueAtTime(freq1, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(freq2, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(freq1, this.audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(freq2, this.audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        break;
    }
    
    // Плавное затухание
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }
  
  async showAlertNotification(alert: {
    level: 'info' | 'warning' | 'danger' | 'critical';
    title: string;
    description: string;
    reasons: string[];
  }) {
    const isUrgent = alert.level === 'critical' || alert.level === 'danger';
    
    // Звуковой сигнал
    let soundType: 'info' | 'warning' | 'critical' = 'warning';
    if (alert.level === 'critical') soundType = 'critical';
    else if (alert.level === 'info') soundType = 'info';
    
    this.playAlertSound(soundType, isUrgent ? 400 : 200);
    
    // Push уведомление
    const body = alert.description + (alert.reasons.length > 0 ? '\n\n• ' + alert.reasons[0] : '');
    
    const notification = await this.showNotification(
      `🚨 ${alert.title}`,
      {
        body,
        tag: `alert-${alert.level}`,
        requireInteraction: isUrgent,
        actions: isUrgent ? [
          { action: 'view', title: 'Посмотреть подробности' },
          { action: 'acknowledge', title: 'Принято к сведению' }
        ] : undefined
      }
    );
    
    // Обработка действий пользователя
    if (notification) {
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      // Повторное уведомление для критичных случаев
      if (isUrgent) {
        setTimeout(() => {
          if (!notification.onclick) { // если не было взаимодействия
            this.playAlertSound('critical', 600);
          }
        }, 30000); // через 30 секунд
      }
    }
    
    return notification;
  }
  
  // Проверка статуса разрешений
  get permissionStatus() {
    return {
      notifications: this.hasPermission,
      audio: !!this.audioContext
    };
  }
  
  // Запрос разрешений заново
  async requestPermissions() {
    if ('Notification' in window && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
    }
    
    // Для аудио нужно взаимодействие пользователя
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
      } catch (e) {
        console.warn('AudioContext initialization failed', e);
      }
    }
    
    return this.permissionStatus;
  }
}