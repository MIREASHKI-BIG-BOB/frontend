// Импортируем явный ESM-бандл html2canvas и именованный jsPDF для надёжного разрешения при сборке
/**
 * Экспортирует CTG ленту в PDF
 * @param element - DOM элемент для экспорта
 * @param filename - Имя файла PDF
 */
export async function exportCTGToPDF(
  element: HTMLElement,
  filename: string = 'ctg-strip.pdf'
): Promise<void> {
  try {
    // Динамически импортируем heavy-зависимости, чтобы избежать проблем с резолвом при билде
    const html2canvasModule: any = await import('html2canvas');
    const html2canvas = html2canvasModule?.default ?? html2canvasModule;
    const pdfModule: any = await import('jspdf');
    const jsPDF = pdfModule?.jsPDF ?? pdfModule?.default ?? pdfModule;

    // Получаем размеры элемента
    const elementWidth = element.scrollWidth;
    const elementHeight = element.scrollHeight;

    // Создаём canvas с высоким разрешением
    const canvas = await html2canvas(element, {
      scale: 2, // Увеличиваем разрешение для лучшего качества
      useCORS: true,
      logging: false,
      backgroundColor: '#fefdfbff',
      width: elementWidth,
      height: elementHeight,
    });

    const imgData = canvas.toDataURL('image/png');

    // Размеры PDF (A4 landscape или custom)
    const pdfWidth = 297; // A4 landscape width in mm
    const pdfHeight = 210; // A4 landscape height in mm

    // Вычисляем соотношение для масштабирования
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;

    // Если лента очень длинная, создаём длинный PDF
    let pdf: any;
    if (ratio > pdfWidth / pdfHeight) {
      // Длинная лента - создаём custom размер
      const customHeight = pdfWidth / ratio;
      pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [customHeight, pdfWidth],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, customHeight);
    } else {
      // Стандартный формат
      pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      const scaledHeight = pdfWidth / ratio;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
    }

    // Сохраняем PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Ошибка при экспорте в PDF:', error);
    throw new Error('Не удалось создать PDF');
  }
}

/**
 * Экспортирует очень длинную CTG ленту в PDF с разбиением на страницы
 */
export async function exportLongCTGToPDF(
  element: HTMLElement,
  filename: string = 'ctg-strip.pdf'
): Promise<void> {
  try {
    const html2canvasModule: any = await import('html2canvas');
    const html2canvas = html2canvasModule?.default ?? html2canvasModule;
    const pdfModule: any = await import('jspdf');
    const jsPDF = pdfModule?.jsPDF ?? pdfModule?.default ?? pdfModule;

    const elementWidth = element.scrollWidth;
    const elementHeight = element.scrollHeight;

    // Создаём canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#fefdfbff',
      width: elementWidth,
      height: elementHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Создаём PDF с custom размером для длинной ленты
    const pdfWidth = 297; // A4 landscape
    const pdfHeight = (pdfWidth * imgHeight) / imgWidth;

    const pdf = new jsPDF({
      orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: pdfHeight > 500 ? [pdfWidth, pdfHeight] : 'a4',
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('Ошибка при экспорте длинной ленты в PDF:', error);
    throw new Error('Не удалось создать PDF');
  }
}
