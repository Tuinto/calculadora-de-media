/**
 * Calculadora de Média Escolar
 * Script com verificação estrita dos três campos:
 * - Todos os 3 campos devem ser preenchidos antes de calcular
 * - Aceita apenas valores entre 0 e 10
 * - Se algum campo estiver vazio, menor que 0 ou maior que 10, exibe mensagem de erro e NÃO calcula
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos do Formulário
  const form = document.getElementById('calculatorForm');
  const grade1Input = document.getElementById('grade1');
  const grade2Input = document.getElementById('grade2');
  const grade3Input = document.getElementById('grade3');
  const errGrade1 = document.getElementById('err-grade1');
  const errGrade2 = document.getElementById('err-grade2');
  const errGrade3 = document.getElementById('err-grade3');
  const formAlertBanner = document.getElementById('formAlertBanner');
  const formAlertText = document.getElementById('formAlertText');

  // Botões
  const btnCalculate = document.getElementById('btnCalculate');
  const btnClear = document.getElementById('btnClear');
  const themeToggle = document.getElementById('themeToggle');

  // Elementos da Área de Resultado
  const resultSection = document.getElementById('resultSection');
  const finalAverage = document.getElementById('finalAverage');
  const statusBadge = document.getElementById('statusBadge');
  const statusIcon = document.getElementById('statusIcon');
  const statusText = document.getElementById('statusText');
  const performanceFill = document.getElementById('performanceFill');
  const sumN1 = document.getElementById('sumN1');
  const sumN2 = document.getElementById('sumN2');
  const sumN3 = document.getElementById('sumN3');
  const sumTotal = document.getElementById('sumTotal');
  const statusMessageCard = document.getElementById('statusMessageCard');
  const statusMessageText = document.getElementById('statusMessageText');

  // Ícones SVG para os status
  const ICONS = {
    approved: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    'needs-improvement': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    failed: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
  };

  const FIELD_NAMES = {
    grade1: '1ª Nota',
    grade2: '2ª Nota',
    grade3: '3ª Nota'
  };

  // Inicialização do tema claro / escuro
  initTheme();

  function initTheme() {
    try {
      const savedTheme = localStorage.getItem('calc_media_theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
      }

      themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        try {
          localStorage.setItem('calc_media_theme', isDark ? 'dark' : 'light');
        } catch (e) {
          // Ignora se o armazenamento local estiver desabilitado no navegador
        }
      });
    } catch (e) {
      // Fallback gracioso caso o navegador restrinja o localStorage
    }
  }

  // Formatação de nota para o padrão brasileiro com vírgula (ex: 7,5 ou 8,17)
  function formatGrade(num) {
    if (num === null || isNaN(num)) return '-';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  }

  /**
   * Validação estrita de cada campo de nota:
   * - Verifica se o campo foi preenchido
   * - Verifica se está entre 0 e 10
   * - Retorna objeto { ok: true, value: float } se for válido
   * - Retorna objeto { ok: false, error: '...', field: '...' } se for inválido
   */
  function validateGradeField(inputEl, errorEl, isSubmitting = false) {
    const raw = inputEl.value.trim();
    const fieldName = FIELD_NAMES[inputEl.id] || 'Nota';

    // 1. Campo vazio (não preenchido)
    if (raw === '') {
      inputEl.classList.remove('input-valid');
      if (isSubmitting) {
        inputEl.classList.add('input-error');
        inputEl.setAttribute('aria-invalid', 'true');
        errorEl.textContent = `Preencha a ${fieldName} com um valor de 0 a 10.`;
        return { ok: false, error: 'empty', field: fieldName };
      }
      inputEl.classList.remove('input-error');
      inputEl.setAttribute('aria-invalid', 'false');
      errorEl.textContent = '';
      return null;
    }

    // 2. Valor menor que 0
    if (raw.startsWith('-')) {
      inputEl.classList.remove('input-valid');
      inputEl.classList.add('input-error');
      inputEl.setAttribute('aria-invalid', 'true');
      errorEl.textContent = 'Erro: A nota não pode ser menor que 0.';
      return { ok: false, error: 'negative', field: fieldName };
    }

    // 3. Caracteres não numéricos
    if (/[^\d,.]/.test(raw)) {
      inputEl.classList.remove('input-valid');
      inputEl.classList.add('input-error');
      inputEl.setAttribute('aria-invalid', 'true');
      errorEl.textContent = 'Erro: Digite apenas números entre 0 e 10.';
      return { ok: false, error: 'invalid_chars', field: fieldName };
    }

    // 4. Múltiplos separadores decimais
    const separatorsCount = (raw.match(/[,.]/g) || []).length;
    if (separatorsCount > 1) {
      inputEl.classList.remove('input-valid');
      inputEl.classList.add('input-error');
      inputEl.setAttribute('aria-invalid', 'true');
      errorEl.textContent = 'Erro: Use apenas uma vírgula ou ponto.';
      return { ok: false, error: 'multiple_separators', field: fieldName };
    }

    // Conversão para número decimal
    const normalized = raw.replace(',', '.');
    const num = parseFloat(normalized);

    if (isNaN(num)) {
      inputEl.classList.remove('input-valid');
      inputEl.classList.add('input-error');
      inputEl.setAttribute('aria-invalid', 'true');
      errorEl.textContent = 'Erro: Valor numérico inválido.';
      return { ok: false, error: 'nan', field: fieldName };
    }

    // Verificação de valor menor que 0
    if (num < 0) {
      inputEl.classList.remove('input-valid');
      inputEl.classList.add('input-error');
      inputEl.setAttribute('aria-invalid', 'true');
      errorEl.textContent = 'Erro: A nota não pode ser menor que 0.';
      return { ok: false, error: 'negative', field: fieldName };
    }

    // Verificação de valor maior que 10
    if (num > 10) {
      inputEl.classList.remove('input-valid');
      inputEl.classList.add('input-error');
      inputEl.setAttribute('aria-invalid', 'true');

      if (num >= 11 && num <= 100 && !raw.includes(',') && !raw.includes('.')) {
        const suggested = (num / 10).toLocaleString('pt-BR', { minimumFractionDigits: 1 });
        errorEl.textContent = `Erro: Nota maior que 10. Você quis dizer ${suggested}?`;
      } else {
        errorEl.textContent = 'Erro: A nota não pode ser maior que 10.';
      }
      return { ok: false, error: 'too_high', field: fieldName };
    }

    // Sucesso: nota válida entre 0 e 10
    inputEl.classList.remove('input-error');
    inputEl.classList.add('input-valid');
    inputEl.setAttribute('aria-invalid', 'false');
    errorEl.textContent = '';
    return { ok: true, value: num };
  }

  // Validação dinâmica conforme o usuário digita nos campos
  [grade1Input, grade2Input, grade3Input].forEach((input, index) => {
    const errorEls = [errGrade1, errGrade2, errGrade3];
    input.addEventListener('input', () => {
      validateGradeField(input, errorEls[index], false);

      // Oculta o banner de alerta geral se todos os campos estiverem válidos
      const r1 = validateGradeField(grade1Input, errGrade1, false);
      const r2 = validateGradeField(grade2Input, errGrade2, false);
      const r3 = validateGradeField(grade3Input, errGrade3, false);

      if (r1 && r1.ok && r2 && r2.ok && r3 && r3.ok) {
        formAlertBanner.classList.add('hidden');
      }
    });
  });

  /**
   * Executa a verificação dos 3 campos e realiza o cálculo da média
   */
  function handleCalculate() {
    const res1 = validateGradeField(grade1Input, errGrade1, true);
    const res2 = validateGradeField(grade2Input, errGrade2, true);
    const res3 = validateGradeField(grade3Input, errGrade3, true);

    const results = [res1, res2, res3];
    const inputs = [grade1Input, grade2Input, grade3Input];

    // Verifica se algum dos três campos é inválido ou não foi preenchido
    const errors = results.filter(r => !r || !r.ok);

    if (errors.length > 0) {
      // Identifica o tipo de erro para exibir mensagem clara e específica
      const hasEmpty = errors.some(e => e.error === 'empty');
      const hasNegative = errors.some(e => e.error === 'negative');
      const hasTooHigh = errors.some(e => e.error === 'too_high');

      if (hasEmpty) {
        formAlertText.textContent = 'Atenção: Os três campos devem ser preenchidos antes de realizar o cálculo.';
      } else if (hasNegative) {
        formAlertText.textContent = 'Atenção: A nota informada não pode ser menor que 0. Digite valores entre 0 e 10.';
      } else if (hasTooHigh) {
        formAlertText.textContent = 'Atenção: A nota informada não pode ser maior que 10. Digite valores entre 0 e 10.';
      } else {
        formAlertText.textContent = 'Atenção: As notas devem aceitar apenas valores entre 0 e 10. Corrija os campos destacados.';
      }

      // Mostra o aviso e NÃO realiza o cálculo (garante que o resultado continue oculto)
      formAlertBanner.classList.remove('hidden');
      resultSection.classList.add('hidden');

      // Foca automaticamente no primeiro campo com erro
      for (let i = 0; i < results.length; i++) {
        if (!results[i] || !results[i].ok) {
          inputs[i].focus();
          break;
        }
      }
      return;
    }

    // Todos os três campos foram devidamente preenchidos com notas entre 0 e 10!
    formAlertBanner.classList.add('hidden');

    const n1 = res1.value;
    const n2 = res2.value;
    const n3 = res3.value;

    // Cálculo da média aritmética: (N1 + N2 + N3) / 3
    const sum = n1 + n2 + n3;
    const avg = sum / 3;

    // Definição da situação escolar:
    // Média de 5,0 até 10,0 → Aprovado
    // Média de 3,0 até 4,9 → Precisa melhorar
    // Média de 0 até 2,9 → Reprovado
    let status = 'approved';
    let statusLabel = 'Aprovado';
    let message = '';

    if (avg >= 5.0) {
      status = 'approved';
      statusLabel = 'Aprovado';
      message = `Parabéns! Sua média é <strong>${formatGrade(avg)}</strong>. Você atingiu a nota mínima de 5,0 e está <strong>aprovado</strong>! 🎉`;
    } else if (avg >= 3.0) {
      status = 'needs-improvement';
      statusLabel = 'Precisa melhorar';
      const missing = 5.0 - avg;
      message = `Atenção: Sua média é <strong>${formatGrade(avg)}</strong>, ficando abaixo da média mínima de 5,0. Faltam <strong>${formatGrade(missing)}</strong> ponto(s) para atingir a média escolar de 5,0. Você <strong>precisa melhorar</strong>. Continue se esforçando nos estudos! 📚`;
    } else {
      status = 'failed';
      statusLabel = 'Reprovado';
      const missing = 5.0 - avg;
      message = `Atenção: Sua média é <strong>${formatGrade(avg)}</strong> e você está <strong>reprovado</strong>. Faltam <strong>${formatGrade(missing)}</strong> ponto(s) para atingir a média escolar de 5,0. Converse com seu professor e dedique-se aos estudos para recuperar a nota! ⚠️`;
    }

    // Exibe o bloco do resultado aplicando a animação suave de entrada
    resultSection.classList.remove('hidden');
    resultSection.classList.remove('result-fade-in');
    void resultSection.offsetWidth; // Força reflow para reiniciar a animação
    resultSection.classList.add('result-fade-in');

    // Atualiza a média
    finalAverage.textContent = formatGrade(avg);

    // Atualiza a etiqueta de situação (Aprovado / Precisa melhorar)
    statusBadge.className = `status-badge ${status}`;
    statusIcon.innerHTML = ICONS[status];
    statusText.textContent = statusLabel;

    // Atualiza a barra visual de desempenho com preenchimento animado
    const percentage = Math.min(Math.max((avg / 10) * 100, 0), 100);
    performanceFill.className = `performance-bar-fill ${status}`;
    performanceFill.style.width = '0%';
    setTimeout(() => {
      performanceFill.style.width = `${percentage}%`;
    }, 40);

    // Atualiza o resumo das 3 notas
    sumN1.textContent = formatGrade(n1);
    sumN2.textContent = formatGrade(n2);
    sumN3.textContent = formatGrade(n3);
    sumTotal.textContent = formatGrade(sum);

    // Atualiza a mensagem explicativa
    statusMessageCard.className = `status-message-card ${status}`;
    statusMessageText.innerHTML = message;

    // Rola suavemente até o resultado para visualização imediata
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Evento do botão "Calcular Média"
  btnCalculate.addEventListener('click', handleCalculate);

  // Permite calcular pressionando Enter em qualquer campo
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCalculate();
  });

  // Evento do botão "Limpar"
  btnClear.addEventListener('click', () => {
    grade1Input.value = '';
    grade2Input.value = '';
    grade3Input.value = '';

    [errGrade1, errGrade2, errGrade3].forEach(err => err.textContent = '');
    [grade1Input, grade2Input, grade3Input].forEach(inp => {
      inp.classList.remove('input-error', 'input-valid');
      inp.setAttribute('aria-invalid', 'false');
    });

    formAlertBanner.classList.add('hidden');
    resultSection.classList.remove('result-fade-in');
    resultSection.classList.add('hidden');
    grade1Input.focus();
  });
});
