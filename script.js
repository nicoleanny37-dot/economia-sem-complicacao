    function toggleMobileMenu() {
      const menu = document.getElementById('mobile-menu');
      if (menu) menu.classList.toggle('hidden');
    }

    let currentEditorialTheme = 'selic';
    let dynamicBolsoState = {};

    const EditorialKnowledge = {
      dolar: {
        tag: "CÂMBIO & MERCADOS",
        badge: "DÓLAR EM ALTA",
        whyMatters: "O dólar alto encarece produtos que você consome diariamente sem perceber: do pão francês (feito de trigo importado) e café até a gasolina e eletrônicos. Por outro lado, empresas que exportam soja e minério faturam mais.",
        step1Title: "OSCILAÇÃO DO DÓLAR",
        step1Text: "A moeda americana registrou nova movimentação frente ao real devido ao diferencial de taxas de juros entre Brasil e EUA e cautela fiscal externa.",
        step2Title: "PRESSÃO EXTERNA & INTERNA",
        step2Text: "Quando investidores internacionais percebem riscos ou quando os juros nos EUA continuam atraentes, o dinheiro sai de países emergentes e volta para os títulos do Tesouro americano.",
        step3Title: "IMPACTO NOS PREÇOS DO BRASIL",
        step3Text: "Com o dólar mais caro, importar insumos fica pesado. As empresas repassam esses custos para as prateleiras, alimentando a inflação de curto prazo.",
        bolso: {
          cartao: {
            title: "COMPRAS INTERNACIONAIS E ASSINATURAS",
            risk: "RISCO: ELEVADO",
            text: "Se você assina streamings faturados no exterior, compra em sites gringos ou viaja, cada centavo de alta no dólar mais o IOF de 4,38% encarece sua fatura no vencimento.",
            tip: "DICA DO JORNAL: Se tiver viagem marcada, compre moeda aos poucos em contas digitais globais para fazer um preço médio."
          },
          financiamento: {
            title: "CARROS E ELETRODOMÉSTICOS",
            risk: "RISCO: MODERADO",
            text: "Veículos e computadores usam chips e peças cotadas em dólar. A valorização da moeda trava descontos e encarece lançamentos nas concessionárias.",
            tip: "DICA DO JORNAL: Pesquise modelos nacionais com menor índice de componentes importados para conseguir melhores condições."
          },
          supermercado: {
            title: "PÃO, MACARRÃO, CARNE E COMBUSTÍVEL",
            risk: "RISCO: IMEDIATO",
            text: "O Brasil importa mais de metade do trigo que consome. O pãozinho da padaria e o óleo diesel sentem a alta em poucas semanas.",
            tip: "DICA DO JORNAL: Substitua farináceos caros por tubérculos nacionais e priorize feiras locais para economizar."
          },
          investimentos: {
            title: "DIVERSIFICAÇÃO EM MOEDA FORTE",
            risk: "VANTAGEM: PROTEÇÃO",
            text: "Ter uma parcela dos seus investimentos em ETFs atrelados ao S&P 500 protege seu poder de compra contra a desvalorização do real.",
            tip: "DICA DO JORNAL: Use ativos internacionais apenas como blindagem patrimonial de longo prazo."
          }
        },
        resumo: [
          { title: "1. DÓLAR ATIVO", text: "Moeda americana dita o ritmo dos preços de insumos e passagens aéreas." },
          { title: "2. PRESSÃO DE IMPORTAÇÃO", text: "Trigo, combustíveis e componentes sofrem repasse quase imediato." },
          { title: "3. FED vs COPOM", text: "Diferença entre juros do Brasil e dos EUA determina o fluxo de capital." },
          { title: "4. IMPACTO NO VAREJO", text: "Comércio segura promoções para compensar o custo de reposição de estoque." },
          { title: "5. PROTEÇÃO DO BOLSO", text: "Evite compras parceladas no cartão em moeda estrangeira neste momento." }
        ]
      },
      inflacao: {
        tag: "PODER DE COMPRA",
        badge: "PREÇOS & IPCA",
        whyMatters: "A inflação não é apenas um número: ela corrói o valor do seu salário. Se ela sobe e seu salário continua igual, no final do mês você compra menos comida.",
        step1Title: "PRESSÃO NO IPCA",
        step1Text: "Dados recentes do IBGE apontam variações no custo de vida, puxadas por alimentação, energia elétrica e tarifas de transporte.",
        step2Title: "CUSTOS CLIMÁTICOS E LOGÍSTICOS",
        step2Text: "Períodos de estiagem afetam a geração hidrelétrica acionando bandeiras tarifárias e encarecendo lavouras.",
        step3Title: "RESPOSTA DO BANCO CENTRAL",
        step3Text: "Para evitar que a inflação saia do controle, a autoridade monetária mantém juros elevados, esfriando a circulação de dinheiro.",
        bolso: {
          cartao: {
            title: "CONTROLE DAS COMPRAS A PRAZO",
            risk: "RISCO: MODERADO",
            text: "Com os preços subindo, parcelar o supermercado no cartão acumula parcelas fixas sobre uma renda que não cresceu.",
            tip: "DICA DO JORNAL: Alimentação do mês deve ser sempre quitada à vista ou no débito."
          },
          financiamento: {
            title: "CONTRATOS ATRELADOS AO IPCA",
            risk: "RISCO: ALTO",
            text: "Financiamentos imobiliários indexados à inflação têm parcelas reajustadas mensalmente, podendo estourar o orçamento.",
            tip: "DICA DO JORNAL: Dê preferência a taxas prefixadas ou atreladas à TR."
          },
          supermercado: {
            title: "CESTA BÁSICA E ITENS ESSENCIAIS",
            risk: "RISCO: DIRETO",
            text: "O setor de alimentos é o primeiro a sentir repasses de energia e combustíveis.",
            tip: "DICA DO JORNAL: Aproveite promoções semanais de feira limpa e atacarejo."
          },
          investimentos: {
            title: "TÍTULOS IPCA+ (TESOURO RENDA+)",
            risk: "VANTAGEM: RENDIMENTO REAL",
            text: "Aplicações no Tesouro IPCA+ garantem que seu dinheiro rende a inflação mais uma taxa fixa.",
            tip: "DICA DO JORNAL: Nunca guarde dinheiro parado na poupança velha."
          }
        },
        resumo: [
          { title: "1. PREÇOS EM MOVIMENTO", text: "Alimentação e energia elétrica definem a direção do custo de vida." },
          { title: "2. SALÁRIO CORROÍDO", text: "Sem reajuste, o carrinho de compras fica menor." },
          { title: "3. BANCO CENTRAL ATENTO", text: "Controle de juros busca forçar lojistas a segurar repasses." },
          { title: "4. ATENÇÃO AO MERCADO", text: "Pesquisa de marcas similares gera alívio na despesa mensal." },
          { title: "5. PROTEJA A RESERVA", text: "Aporte em títulos com garantia de juro real acima do IPCA." }
        ]
      },
      selic: {
        tag: "POLÍTICA MONETÁRIA",
        badge: "TAXA DE JUROS",
        whyMatters: "A Selic determina o custo do dinheiro em todo o país: quanto maior ela for, mais caro fica pegar empréstimo, mas melhor fica o rendimento de quem poupa.",
        step1Title: "DECISÃO DE JUROS",
        step1Text: "O Copom mantém postura de vigilância estrita para assegurar a meta de inflação e a estabilidade financeira.",
        step2Title: "EQUILÍBRIO ENTRE CONSUMO E PREÇOS",
        step2Text: "Juros elevados encarecem as linhas de crédito bancárias, fazendo com que pessoas e empresas pensem duas vezes antes de gastar.",
        step3Title: "O DESTINO DOS DÓLARES",
        step3Text: "Com taxas remunerando acima de 10% ao ano, investidores globais trazem dólares para lucrar com a renda fixa.",
        bolso: {
          cartao: {
            title: "ROTATIVO E JUROS BANCÁRIOS",
            risk: "RISCO: MÁXIMO",
            text: "A taxa de juros do rotativo do cartão passa de 440% ao ano com a Selic alta. Uma dívida esquecida vira uma bola de neve.",
            tip: "DICA DO JORNAL: Jamais pague apenas o mínimo da fatura."
          },
          financiamento: {
            title: "PARCELAS DE CARRO E CASA PRÓPRIA",
            risk: "RISCO: MODERADO A ALTO",
            text: "O Custo Efetivo Total (CET) dos financiamentos sobe acompanhando a Selic.",
            tip: "DICA DO JORNAL: Guarde o dinheiro da entrada no Tesouro Selic para render antes de financiar."
          },
          supermercado: {
            title: "PREÇOS NO VAREJO",
            risk: "RISCO: ESTABILIZAÇÃO LENTA",
            text: "A Selic alta atua como um freio de mão na economia, obrigando negociações de preços.",
            tip: "DICA DO JORNAL: Compare preços em aplicativos antes de fechar compras."
          },
          investimentos: {
            title: "RENDA FIXA COM RENDIMENTO CONSISTENTE",
            risk: "VANTAGEM: EXCELENTE",
            text: "CDBs de liquidez diária e Tesouro Selic pagam rendimentos sem risco de oscilação negativa.",
            tip: "DICA DO JORNAL: Construa sua reserva de emergência antes de arriscar em renda variável."
          }
        },
        resumo: [
          { title: "1. JUROS EM VIGILÂNCIA", text: "Copom mantém foco na contenção da inflação e metas." },
          { title: "2. CRÉDITO RESTRITO", text: "Bancos filtram aprovações de empréstimos com rigor." },
          { title: "3. ATRAÇÃO DE CAPITAL", text: "Rendimento atrativo da renda fixa nacional atrai moeda forte." },
          { title: "4. FREIO NO CARTÃO", text: "Atrasar faturas custa caro; priorize quitação." },
          { title: "5. HORA DO POUPADOR", text: "Aplicações conservadoras garantem retorno real seguro." }
        ]
      }
    };

    function detectTheme(text) {
      const lower = text.toLowerCase();
      if (lower.includes('dólar') || lower.includes('dolar') || lower.includes('câmbio') || lower.includes('fed')) return 'dolar';
      if (lower.includes('ipca') || lower.includes('inflação') || lower.includes('preço')) return 'inflacao';
      return 'selic';
    }

    function applyEditorialTheme(themeKey, headlineTitle, headlineDesc) {
      currentEditorialTheme = themeKey;
      const t = EditorialKnowledge[themeKey];
      dynamicBolsoState = t.bolso;

      const heroTitle = document.getElementById('hero-main-title');
      const heroLead = document.getElementById('hero-main-lead');
      if (heroTitle) heroTitle.innerText = headlineTitle.toUpperCase();
      if (heroLead) heroLead.innerText = headlineDesc;

      const artTitle = document.getElementById('article-main-title');
      const artLead = document.getElementById('article-main-lead');
      if (artTitle) artTitle.innerText = headlineTitle.toUpperCase();
      if (artLead) artLead.innerText = headlineDesc;
    }

    async function triggerAutonomousUpdate(isManual = false) {
      const btn = document.getElementById('btn-refresh');
      if (btn && isManual) {
        btn.innerHTML = '<span>BUSCANDO...</span>';
      }

      const syncLabel = document.getElementById('last-sync-time');
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      try {
        const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL');
        if (res.ok) {
          const data = await res.json();
          if (data.USDBRL) {
            const usd = parseFloat(data.USDBRL.bid).toFixed(3);
            document.getElementById('ticker-usd').innerText = `R$ ${usd}`;
            document.getElementById('hero-coin-usd').innerText = `R$ ${usd.slice(0, 4)}`;
            document.getElementById('market-card-usd-val').innerText = `R$ ${usd}`;
          }
          if (data.EURBRL) {
            document.getElementById('ticker-eur').innerText = `R$ ${parseFloat(data.EURBRL.bid).toFixed(3)}`;
          }
          if (data.BTCBRL) {
            document.getElementById('ticker-btc').innerText = `R$ ${Math.round(parseFloat(data.BTCBRL.bid)).toLocaleString('pt-BR')}`;
          }
        }
      } catch (err) {
        console.log("Cotações mantidas em contingência local.");
      }

      if (syncLabel) syncLabel.innerText = `Hoje às ${timeStr}`;

      if (btn && isManual) {
        btn.innerHTML = '<span>✓ ATUALIZADO!</span>';
        setTimeout(() => {
          btn.innerHTML = '<span>ATUALIZAR</span><span>↗</span>';
        }, 1800);
      }
    }

    const ONE_HOUR_SECONDS = 3600;
    let secondsRemaining = ONE_HOUR_SECONDS;

    function updateCountdown() {
      secondsRemaining--;
      if (secondsRemaining <= 0) {
        secondsRemaining = ONE_HOUR_SECONDS;
        triggerAutonomousUpdate(false);
      }
      const minutes = Math.floor(secondsRemaining / 60);
      const seconds = secondsRemaining % 60;
      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      const headerCd = document.getElementById('header-countdown');
      if (headerCd) headerCd.innerText = formatted;
    }

    function updateLiveClock() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');

      const timeBadge = document.getElementById('header-timestamp');
      if (timeBadge) timeBadge.innerText = `${h}:${m}:${s}`;
    }

    window.addEventListener('load', () => {
      updateLiveClock();
      setInterval(updateLiveClock, 1000);
      setInterval(updateCountdown, 1000);
      triggerAutonomousUpdate(false);
    });
