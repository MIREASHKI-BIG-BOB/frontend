export type AlertLevel = 'info' | 'warning' | 'danger' | 'critical';

export interface Alert {
  id: string;
  level: AlertLevel;
  title: string;
  description: string;
  reasons: string[];
  timestamp: Date;
  resolved: boolean;
  patientData?: {
    fhr: number[];
    uc: number[];
    timeWindow: number; // minutes
  };
}

export interface AlertRule {
  id: string;
  name: string;
  check: (data: { fhr: number[]; uc: number[]; timeWindow: number }) => Alert | null;
  priority: number;
}

// Медицинские правила для детекции аномалий
export const ALERT_RULES: AlertRule[] = [
  {
    id: 'bradycardia',
    name: 'Брадикардия плода',
    priority: 90,
    check: ({ fhr }) => {
      const recent = fhr.slice(-30); // последние 30 точек (30 сек)
      const avgFhr = recent.reduce((sum, val) => sum + val, 0) / recent.length;
      const bradyCount = recent.filter(val => val < 110).length;
      
      if (avgFhr < 110 || bradyCount > 15) {
        return {
          id: `bradycardia-${Date.now()}`,
          level: 'critical',
          title: 'Критическая брадикардия плода',
          description: 'Частота сердечных сокращений плода значительно ниже нормы',
          reasons: [
            `Средняя ЧСС: ${Math.round(avgFhr)} уд/мин (норма: 120-160)`,
            `${bradyCount} из 30 измерений ниже 110 уд/мин`,
            'Возможна гипоксия плода',
            'Требуется немедленная оценка врача'
          ],
          timestamp: new Date(),
          resolved: false,
          patientData: { fhr, uc: [], timeWindow: 0.5 }
        };
      }
      return null;
    }
  },
  
  {
    id: 'tachycardia',
    name: 'Тахикардия плода',
    priority: 80,
    check: ({ fhr }) => {
      const recent = fhr.slice(-30);
      const avgFhr = recent.reduce((sum, val) => sum + val, 0) / recent.length;
      const tachyCount = recent.filter(val => val > 160).length;
      
      if (avgFhr > 160 || tachyCount > 15) {
        return {
          id: `tachycardia-${Date.now()}`,
          level: 'warning',
          title: 'Тахикардия плода',
          description: 'Учащенное сердцебиение плода',
          reasons: [
            `Средняя ЧСС: ${Math.round(avgFhr)} уд/мин (норма: 120-160)`,
            `${tachyCount} из 30 измерений выше 160 уд/мин`,
            'Возможные причины: стресс матери, инфекция, лихорадка',
            'Рекомендуется наблюдение'
          ],
          timestamp: new Date(),
          resolved: false,
          patientData: { fhr, uc: [], timeWindow: 0.5 }
        };
      }
      return null;
    }
  },

  {
    id: 'late_decelerations',
    name: 'Поздние децелерации',
    priority: 95,
    check: ({ fhr, uc }) => {
      if (fhr.length < 60 || uc.length < 60) return null;
      
      // Поиск паттерна: высокий UC, затем через 10-20 сек падение FHR
      const recent = Math.min(fhr.length, 120); // последние 2 минуты
      let decelerations = 0;
      let contractionPeaks = 0;
      
      for (let i = 10; i < recent - 10; i++) {
        // Пик схватки
        if (uc[uc.length - recent + i] > 50) {
          contractionPeaks++;
          // Проверяем FHR через 10-20 секунд
          for (let j = 10; j <= 20; j++) {
            if (i + j < recent && fhr[fhr.length - recent + i + j] < fhr[fhr.length - recent + i] - 15) {
              decelerations++;
              break;
            }
          }
        }
      }
      
      if (decelerations >= 2 && contractionPeaks >= 2) {
        return {
          id: `late_decel-${Date.now()}`,
          level: 'critical',
          title: 'Поздние децелерации',
          description: 'Опасный паттерн: снижение ЧСС после пика схватки',
          reasons: [
            `Обнаружено ${decelerations} поздних децелераций за 2 минуты`,
            `${contractionPeaks} схваток с последующим падением ЧСС`,
            'Признак нарушения маточно-плацентарного кровотока',
            'Высокий риск гипоксии плода',
            'Требуется экстренное вмешательство'
          ],
          timestamp: new Date(),
          resolved: false,
          patientData: { fhr, uc, timeWindow: 2 }
        };
      }
      return null;
    }
  },

  {
    id: 'reduced_variability',
    name: 'Снижение вариабельности',
    priority: 70,
    check: ({ fhr }) => {
      if (fhr.length < 60) return null;
      
      const recent = fhr.slice(-60); // последняя минута
      const mean = recent.reduce((sum, val) => sum + val, 0) / recent.length;
      const variance = recent.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recent.length;
      const stdDev = Math.sqrt(variance);
      
      // Нормальная вариабельность: 6-25 уд/мин
      if (stdDev < 3) {
        return {
          id: `low_var-${Date.now()}`,
          level: 'warning',
          title: 'Снижена вариабельность ЧСС',
          description: 'Недостаточная изменчивость сердечного ритма плода',
          reasons: [
            `Вариабельность: ${Math.round(stdDev)} уд/мин (норма: 6-25)`,
            `Снижение на ${Math.round((6 - stdDev) / 6 * 100)}% от нижней границы нормы`,
            'Возможные причины: сон плода, медикаменты, гипоксия',
            'Требуется продолжительное наблюдение'
          ],
          timestamp: new Date(),
          resolved: false,
          patientData: { fhr, uc: [], timeWindow: 1 }
        };
      }
      return null;
    }
  },

  {
    id: 'excessive_contractions',
    name: 'Чрезмерная активность матки',
    priority: 75,
    check: ({ uc }) => {
      if (uc.length < 300) return null; // нужно хотя бы 5 минут данных
      
      const recent = uc.slice(-300); // последние 5 минут
      const strongContractions = recent.filter(val => val > 70).length;
      const peaks = [];
      
      // Подсчет пиков схваток
      for (let i = 1; i < recent.length - 1; i++) {
        if (recent[i] > recent[i-1] && recent[i] > recent[i+1] && recent[i] > 40) {
          peaks.push(i);
        }
      }
      
      const contractionsPerMinute = peaks.length / 5;
      
      if (contractionsPerMinute > 5 || strongContractions > 150) {
        return {
          id: `excessive_uc-${Date.now()}`,
          level: 'warning',
          title: 'Гиперактивность матки',
          description: 'Чрезмерно частые или сильные схватки',
          reasons: [
            `${Math.round(contractionsPerMinute * 10) / 10} схваток/мин (норма: 2-4)`,
            `${Math.round(strongContractions / 3)}% времени схватки >70 mmHg`,
            'Риск утомления матки и нарушения кровотока',
            'Возможна необходимость токолиза'
          ],
          timestamp: new Date(),
          resolved: false,
          patientData: { fhr: [], uc, timeWindow: 5 }
        };
      }
      return null;
    }
  }
];

export class AlertSystem {
  private alerts: Alert[] = [];
  private callbacks: ((alerts: Alert[]) => void)[] = [];
  
  checkForAlerts(fhr: number[], uc: number[]): Alert[] {
    const timeWindow = Math.max(fhr.length, uc.length) / 60; // в минутах
    const newAlerts: Alert[] = [];
    
    // Проверяем каждое правило
    for (const rule of ALERT_RULES) {
      const alert = rule.check({ fhr, uc, timeWindow });
      if (alert) {
        // Избегаем дублирования похожих тревог
        const existingAlert = this.alerts.find(a => 
          a.title === alert.title && 
          !a.resolved && 
          Date.now() - a.timestamp.getTime() < 30000 // последние 30 сек
        );
        
        if (!existingAlert) {
          newAlerts.push(alert);
          this.alerts.unshift(alert); // добавляем в начало списка
        }
      }
    }
    
    // Автоматически резолвим старые тревоги (старше 5 минут)
    this.alerts.forEach(alert => {
      if (!alert.resolved && Date.now() - alert.timestamp.getTime() > 300000) {
        alert.resolved = true;
      }
    });
    
    if (newAlerts.length > 0) {
      this.notifyCallbacks();
    }
    
    return newAlerts;
  }
  
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }
  
  getAllAlerts(): Alert[] {
    return this.alerts;
  }
  
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.notifyCallbacks();
    }
  }
  
  subscribe(callback: (alerts: Alert[]) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }
  
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback(this.alerts));
  }
}