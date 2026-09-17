/* =========================================================
   ECONOMIA SEM COMPLICAÇÃO
   SCRIPT.JS
   ========================================================= */

"use strict";


/* =========================================================
   1. CONFIGURAÇÃO GERAL
   ========================================================= */

const CONFIG = {
    locale: "pt-BR",
    currency: "BRL",

    /*
     * O frontend está preparado para receber dados reais.
     * Não inserir números atuais fictícios aqui.
     */
    dataMode: "real-data-ready"
};


/* =========================================================
   2. FUNÇÕES UTILITÁRIAS
   ========================================================= */

/**
 * Seleciona um elemento.
 */
function $(selector, parent = document) {
    return parent.querySelector(selector);
}


/**
 * Seleciona vários elementos.
 */
function $$(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
}


/**
 * Formata valores em reais.
 */
function formatBRL(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "Dados indisponíveis";
    }

    return number.toLocaleString(CONFIG.locale, {
        style: "currency",
        currency: CONFIG.currency
    });
}


/**
 * Formata porcentagem.
 */
function formatPercent(value, decimals = 2) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "Dados indisponíveis";
    }

    return `${number.toLocaleString(CONFIG.locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })}%`;
}


/**
 * Formata números.
 */
function formatNumber(value, decimals = 2) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "Dados indisponíveis";
    }

    return number.toLocaleString(CONFIG.locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}


/**
 * Formata data e horário.
 */
function formatDateTime(dateValue = new Date()) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Data indisponível";
    }

    return date.toLocaleString(CONFIG.locale, {
        dateStyle: "short",
        timeStyle: "short"
    });
}


/**
 * Escapa HTML antes de inserir texto externo.
 */
function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/**
 * Mostra estado de indisponibilidade.
 */
function showUnavailable(element, message = "Dados indisponíveis no momento.") {
    if (!element) return;

    element.innerHTML = `
        <div class="data-unavailable">
            ${escapeHTML(message)}
        </div>
    `;
}


/* =========================================================
   3. RELÓGIO / DATA
   ========================================================= */

function updateDateTime() {
    const elements = $$("[data-current-datetime]");

    if (!elements.length) return;

    const now = new Date();

    elements.forEach((element) => {
        element.textContent = formatDateTime(now);
    });
}

updateDateTime();

setInterval(updateDateTime, 30000);


/* =========================================================
   4. MENU MOBILE
   ========================================================= */

function initializeMobileMenu() {
    const button = $(".mobile-menu-button");
    const nav = $(".main-nav");

    if (!button || !nav) return;

    button.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("is-open");

        button.setAttribute("aria-expanded", String(isOpen));

        button.textContent = isOpen
            ? "FECHAR MENU"
            : "ABRIR MENU";
    });

    $$(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("is-open");
            button.setAttribute("aria-expanded", "false");
            button.textContent = "ABRIR MENU";
        });
    });
}

initializeMobileMenu();


/* =========================================================
   5. NAVEGAÇÃO SUAVE
   ========================================================= */

function initializeSmoothNavigation() {
    $$(".nav-link[href^='#']").forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
}

initializeSmoothNavigation();


/* =========================================================
   6. ECONOMÊS
   ========================================================= */

/*
 * O ECONOMÊS NÃO fica limitado a uma lista fixa de palavras.
 *
 * A estrutura aceita:
 *
 * - palavra
 * - expressão
 * - pergunta
 * - dúvida econômica
 *
 * Exemplo:
 *
 * "Selic"
 * "IPCA"
 * "Por que o dólar subiu?"
 * "Como a Selic afeta meu financiamento?"
 *
 * Para respostas dinâmicas, o backend/API poderá futuramente
 * fornecer a definição e as fontes verificadas.
 */

const economesLocalDictionary = {

    selic: {
        title: "SELIC",
        definition:
            "É a taxa básica de juros da economia brasileira. Ela influencia o custo do crédito, aplicações financeiras e outras taxas de juros.",
        example:
            "Quando os juros básicos sobem, financiamentos e empréstimos podem ficar mais caros.",
        impact:
            "Para uma pessoa, isso pode afetar parcelas e crédito. Para empresas, pode alterar o custo de financiamento e decisões de investimento."
    },

    ipca: {
        title: "IPCA",
        definition:
            "É o principal índice utilizado para medir a inflação ao consumidor no Brasil.",
        example:
            "Se o IPCA aumenta, significa que, em média, os preços pesquisados estão subindo.",
        impact:
            "A inflação afeta o poder de compra das famílias e pode influenciar decisões de preços, salários, juros e planejamento das empresas."
    },

    inflação: {
        title: "INFLAÇÃO",
        definition:
            "É o aumento generalizado e persistente dos preços de bens e serviços ao longo do tempo.",
        example:
            "Se uma cesta de produtos passa a custar mais do que custava anteriormente, o consumidor precisa de mais dinheiro para comprar os mesmos itens.",
        impact:
            "A inflação reduz o poder de compra quando a renda não acompanha a evolução dos preços."
    },

    cdi: {
        title: "CDI",
        definition:
            "CDI é uma referência importante para diversas operações financeiras e para a remuneração de vários investimentos de renda fixa.",
        example:
            "Um investimento que rende determinado percentual do CDI acompanha essa referência conforme as condições do mercado.",
        impact:
            "O CDI aparece frequentemente na comparação de investimentos e pode influenciar a remuneração de aplicações de renda fixa."
    },

    câmbio: {
        title: "CÂMBIO",
        definition:
            "É o mercado e o conjunto de relações que determinam a troca entre diferentes moedas.",
        example:
            "Uma empresa brasileira que precisa pagar um fornecedor em dólares precisa converter reais em moeda estrangeira.",
        impact:
            "Variações cambiais podem alterar preços de produtos importados, custos de empresas e receitas de exportadores."
    },

    juros: {
        title: "JUROS",
        definition:
            "São o custo de utilizar dinheiro ao longo do tempo ou a remuneração recebida por disponibilizar recursos.",
        example:
            "Ao contratar um empréstimo, os juros representam parte do custo pago além do valor originalmente emprestado.",
        impact:
            "Os juros influenciam empréstimos, financiamentos, investimentos, consumo e decisões empresariais."
    },

    deflação: {
        title: "DEFLAÇÃO",
        definition:
            "É uma queda generalizada e persistente do nível de preços.",
        example:
            "Uma redução isolada no preço de um produto não caracteriza necessariamente deflação.",
        impact:
            "Deflação persistente pode afetar consumo, receitas das empresas e decisões de investimento."
    },

    spread: {
        title: "SPREAD",
        definition:
            "É a diferença entre duas taxas, preços ou condições financeiras. No crédito bancário, o termo pode ser usado para representar a diferença entre o custo de captação e a taxa cobrada do cliente.",
        example:
            "Um banco capta recursos a determinado custo e concede crédito a uma taxa maior.",
        impact:
            "O spread pode ajudar a explicar por que a taxa final de um empréstimo é diferente da taxa básica da economia."
    },

    cet: {
        title: "CET",
        definition:
            "Custo Efetivo Total é uma medida que reúne os custos de uma operação de crédito para permitir uma comparação mais completa entre propostas.",
        example:
            "Uma proposta de financiamento pode ter juros, tarifas, seguros e outros custos que precisam ser considerados no custo total.",
        impact:
            "Para comparar financiamentos, olhar apenas a taxa de juros pode não mostrar todo o custo da operação."
    },

    pib: {
        title: "PIB",
        definition:
            "Produto Interno Bruto é uma medida do valor dos bens e serviços finais produzidos em uma economia durante determinado período.",
        example:
            "O PIB pode ser utilizado para acompanhar a atividade econômica de um país.",
        impact:
            "A evolução do PIB ajuda a entender o ritmo da atividade econômica, embora não represente sozinho renda, distribuição de riqueza ou qualidade de vida."
    }

};


/**
 * Normaliza texto para facilitar buscas.
 */
function normalizeText(text) {
    return String(text || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}


/**
 * Procura uma definição local.
 */
function findEconomesLocal(query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return null;
    }

    const exactKey = Object.keys(economesLocalDictionary)
        .find((key) => normalizeText(key) === normalizedQuery);

    if (exactKey) {
        return economesLocalDictionary[exactKey];
    }

    const partialKey = Object.keys(economesLocalDictionary)
        .find((key) => normalizedQuery.includes(normalizeText(key)));

    if (partialKey) {
        return economesLocalDictionary[partialKey];
    }

    return null;
}


/**
 * Exibe resultado do ECONOMÊS.
 */
function renderEconomesResult(result, query) {
    const container = $(".economes-result");

    if (!container) return;

    if (!result) {
        container.innerHTML = `
            <span class="economes-result-label">
                Resultado
            </span>

            <h3>Termo não encontrado</h3>

            <p class="economes-definition">
                Não encontramos uma definição confiável para
                <strong>${escapeHTML(query)}</strong>.
            </p>

            <div class="economes-example">
                <span class="economes-result-label">
                    Como continuar
                </span>

                Tente escrever o termo completo ou fazer uma pergunta,
                como "por que o dólar subiu?" ou
                "como a Selic afeta meu financiamento?"
            </div>
        `;

        container.classList.add("is-visible");
        return;
    }

    container.innerHTML = `
        <span class="economes-result-label">
            ECONOMÊS
        </span>

        <h3>${escapeHTML(result.title)}</h3>

        <p class="economes-definition">
            ${escapeHTML(result.definition)}
        </p>

        <div class="economes-example">
            <span class="economes-result-label">
                Exemplo
            </span>

            ${escapeHTML(result.example)}
        </div>

        <div class="economes-impact">
            <span class="economes-result-label">
                Impacto no seu dia a dia
            </span>

            ${escapeHTML(result.impact)}
        </div>
    `;

    container.classList.add("is-visible");
}


/**
 * Inicializa ECONOMÊS.
 */
function initializeEconomes() {
    const input = $(".economes-input");
    const button = $(".economes-button");

    if (!input || !button) return;

    function search() {
        const query = input.value.trim();

        if (!query) {
            renderEconomesResult(null, "termo vazio");
            return;
        }

        const result = findEconomesLocal(query);

        renderEconomesResult(result, query);
    }

    button.addEventListener("click", search);

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            search();
        }
    });
}

initializeEconomes();


/* =========================================================
   7. SIMULADOR DE FINANCIAMENTO
   ========================================================= */

/**
 * Converte taxa anual efetiva para mensal efetiva.
 */
function annualToMonthlyRate(annualRate) {
    const annual = Number(annualRate);

    if (!Number.isFinite(annual) || annual < 0) {
        return 0;
    }

    return Math.pow(1 + annual / 100, 1 / 12) - 1;
}


/**
 * Calcula financiamento PRICE.
 */
function calculatePrice(principal, monthlyRate, months) {
    if (
        !Number.isFinite(principal) ||
        principal <= 0 ||
        !Number.isFinite(months) ||
        months <= 0
    ) {
        return null;
    }

    if (monthlyRate === 0) {
        const payment = principal / months;

        return {
            firstPayment: payment,
            lastPayment: payment,
            totalPaid: principal,
            totalInterest: 0
        };
    }

    const factor = Math.pow(1 + monthlyRate, months);

    const payment =
        principal *
        (monthlyRate * factor) /
        (factor - 1);

    const totalPaid = payment * months;

    return {
        firstPayment: payment,
        lastPayment: payment,
        totalPaid,
        totalInterest: totalPaid - principal
    };
}


/**
 * Calcula financiamento SAC.
 */
function calculateSac(principal, monthlyRate, months) {
    if (
        !Number.isFinite(principal) ||
        principal <= 0 ||
        !Number.isFinite(months) ||
        months <= 0
    ) {
        return null;
    }

    const amortization = principal / months;

    let balance = principal;
    let totalPaid = 0;

    let firstPayment = 0;
    let lastPayment = 0;

    for (let month = 1; month <= months; month++) {

        const interest = balance * monthlyRate;

        const payment = amortization + interest;

        if (month === 1) {
            firstPayment = payment;
        }

        if (month === months) {
            lastPayment = payment;
        }

        totalPaid += payment;

        balance -= amortization;

        if (balance < 0) {
            balance = 0;
        }
    }

    return {
        firstPayment,
        lastPayment,
        totalPaid,
        totalInterest: totalPaid - principal
    };
}


/**
 * Atualiza o resultado visual.
 */
function renderSimulatorResult(result, financingAmount) {
    const resultContainer = $(".simulator-result");

    if (!resultContainer) return;

    if (!result) {
        showUnavailable(
            resultContainer,
            "Preencha os valores corretamente para calcular."
        );

        return;
    }

    resultContainer.innerHTML = `
        <h3>Resultado da simulação</h3>

        <div class="result-grid">

            <div class="result-card">
                <span class="result-label">
                    Valor financiado
                </span>

                <strong class="result-value">
                    ${formatBRL(financingAmount)}
                </strong>
            </div>

            <div class="result-card highlight">
                <span class="result-label">
                    Primeira parcela
                </span>

                <strong class="result-value">
                    ${formatBRL(result.firstPayment)}
                </strong>
            </div>

            <div class="result-card">
                <span class="result-label">
                    Última parcela
                </span>

                <strong class="result-value">
                    ${formatBRL(result.lastPayment)}
                </strong>
            </div>

            <div class="result-card">
                <span class="result-label">
                    Total de juros
                </span>

                <strong class="result-value">
                    ${formatBRL(result.totalInterest)}
                </strong>
            </div>

            <div class="result-card highlight">
                <span class="result-label">
                    Total desembolsado
                </span>

                <strong class="result-value">
                    ${formatBRL(result.totalPaid)}
                </strong>
            </div>

        </div>

        <div class="simulator-note">
            Esta é uma simulação matemática. O resultado não representa
            uma proposta de crédito. Custos como CET, seguros, tarifas,
            impostos, indexadores e outras condições contratuais podem
            alterar o valor real de uma operação.
        </div>
    `;
}


/**
 * Inicializa o simulador.
 */
function initializeSimulator() {

    const form = $("#simulator-form");

    if (!form) return;

    form.addEventListener("submit", (event) => {

        event.preventDefault();

        const totalValue =
            Number($("#total-value")?.value || 0);

        const downPayment =
            Number($("#down-payment")?.value || 0);

        const months =
            Number($("#term-months")?.value || 0);

        const annualRate =
            Number($("#annual-interest")?.value || 0);

        const method =
            $("#payment-method")?.value || "sac";

        if (
            totalValue <= 0 ||
            downPayment < 0 ||
            downPayment >= totalValue ||
            months <= 0 ||
            annualRate < 0
        ) {

            renderSimulatorResult(null);

            return;
        }

        const financingAmount =
            totalValue - downPayment;

        const monthlyRate =
            annualToMonthlyRate(annualRate);

        let result;

        if (method === "price") {
            result = calculatePrice(
                financingAmount,
                monthlyRate,
                months
            );
        } else {
            result = calculateSac(
                financingAmount,
                monthlyRate,
                months
            );
        }

        renderSimulatorResult(
            result,
            financingAmount
        );
    });
}

initializeSimulator();


/* =========================================================
   8. NEWSLETTER
   ========================================================= */

/*
 * O frontend NÃO afirma que um e-mail foi enviado.
 *
 * O envio real dependerá de um serviço/backend.
 *
 * Por enquanto:
 * - valida e-mail;
 * - mostra estado de preparação;
 * - deixa estrutura pronta para integração.
 */

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function initializeNewsletter() {

    const form = $(".newsletter-form");

    if (!form) return;

    form.addEventListener("submit", (event) => {

        event.preventDefault();

        const input =
            $(".newsletter-input", form);

        const message =
            $(".newsletter-message", form);

        if (!input || !message) return;

        const email = input.value.trim();

        if (!isValidEmail(email)) {

            message.textContent =
                "Digite um e-mail válido.";

            return;
        }

        /*
         * Aqui entrará futuramente a chamada para
         * o backend/serviço de newsletter.
         */

        message.textContent =
            "Cadastro preparado. A confirmação será enviada quando o serviço de newsletter estiver conectado.";

        input.value = "";
    });
}

initializeNewsletter();


/* =========================================================
   9. LINKS DE FONTE
   ========================================================= */

function initializeExternalLinks() {

    $$("[data-external-link]").forEach((link) => {

        link.addEventListener("click", () => {

            const url = link.dataset.externalLink;

            if (!url) return;

            /*
             * O link só deve ser preenchido com uma URL
             * real e verificada.
             */
        });
    });
}

initializeExternalLinks();


/* =========================================================
   10. CARREGAMENTO DE DADOS
   ========================================================= */

/*
 * Estrutura preparada para o futuro backend/API.
 *
 * Cada módulo poderá receber dados separadamente:
 *
 * - mercado
 * - ações
 * - indicadores
 * - notícias
 * - política & economia
 * - geopolítica
 * - câmbio
 *
 * Não utilizar valores fictícios para representar dados atuais.
 */

const EconomicDataStore = {

    market: null,
    stocks: null,
    indicators: null,
    news: null,
    politicsEconomy: null,
    geopolitics: null,
    exchange: null,

    timestamps: {},

    set(module, data, timestamp = new Date()) {

        if (!(module in this)) {
            return;
        }

        this[module] = data;
        this.timestamps[module] = timestamp;

        document.dispatchEvent(
            new CustomEvent("economic-data-updated", {
                detail: {
                    module,
                    data,
                    timestamp
                }
            })
        );
    },

    get(module) {
        return this[module] || null;
    },

    getTimestamp(module) {
        return this.timestamps[module] || null;
    }
};


/* =========================================================
   11. ATUALIZAÇÃO INDIVIDUAL DOS MÓDULOS
   ========================================================= */

/*
 * Cada módulo é independente.
 *
 * Isso permite que, futuramente, uma atualização de Bolsa
 * aconteça sem precisar recarregar notícias, ECONOMÊS ou
 * outros módulos.
 */

function updateModuleTimestamp(module, element) {

    if (!element) return;

    const timestamp =
        EconomicDataStore.getTimestamp(module);

    if (!timestamp) {
        element.textContent =
            "Atualização não disponível";

        return;
    }

    element.textContent =
        `Atualizado em ${formatDateTime(timestamp)}`;
}


function initializeModuleTimestamps() {

    $$("[data-module-updated]").forEach((element) => {

        const module =
            element.dataset.moduleUpdated;

        updateModuleTimestamp(
            module,
            element
        );
    });
}


document.addEventListener(
    "economic-data-updated",
    (event) => {

        const module =
            event.detail.module;

        $$(`[data-module-updated="${module}"]`)
            .forEach((element) => {

                updateModuleTimestamp(
                    module,
                    element
                );
            });
    }
);

initializeModuleTimestamps();


/* =========================================================
   12. RENDERIZAÇÃO DE MERCADO
   ========================================================= */

function renderMarketData(data) {

    const container =
        $("[data-market-container]");

    if (!container) return;

    if (!Array.isArray(data) || !data.length) {

        showUnavailable(container);

        return;
    }

    container.innerHTML = data.map((item) => {

        const change =
            Number(item.changePercent);

        let changeClass = "change-neutral";

        if (change > 0) {
            changeClass = "change-up";
        }

        if (change < 0) {
            changeClass = "change-down";
        }

        const changeText =
            Number.isFinite(change)
                ? `${change >= 0 ? "+" : ""}${formatPercent(change)}`
                : "N/D";

        return `
            <div class="market-row">

                <span class="market-name">
                    ${escapeHTML(item.name)}
                </span>

                <span class="market-price">
                    ${escapeHTML(item.value)}
                </span>

                <span class="market-change ${changeClass}">
                    ${changeText}
                </span>

            </div>
        `;

    }).join("");
}


document.addEventListener(
    "economic-data-updated",
    (event) => {

        if (event.detail.module !== "market") {
            return;
        }

        renderMarketData(
            event.detail.data
        );
    }
);


/* =========================================================
   13. RENDERIZAÇÃO DE AÇÕES
   ========================================================= */

function renderStocks(data) {

    const upContainer =
        $("[data-stocks-up]");

    const downContainer =
        $("[data-stocks-down]");

    if (!upContainer && !downContainer) {
        return;
    }

    if (!Array.isArray(data)) {

        if (upContainer) showUnavailable(upContainer);
        if (downContainer) showUnavailable(downContainer);

        return;
    }

    const validStocks = data
        .filter((stock) =>
            Number.isFinite(
                Number(stock.changePercent)
            )
        );

    const rising = [...validStocks]
        .filter((stock) =>
            Number(stock.changePercent) > 0
        )
        .sort((a, b) =>
            Number(b.changePercent) -
            Number(a.changePercent)
        );

    const falling = [...validStocks]
        .filter((stock) =>
            Number(stock.changePercent) < 0
        )
        .sort((a, b) =>
            Number(a.changePercent) -
            Number(b.changePercent)
        );


    function createStockCard(stock) {

        const variation =
            Number(stock.changePercent);

        return `
            <article class="stock-card">

                <div class="stock-top">

                    <span class="stock-ticker">
                        ${escapeHTML(stock.ticker || "N/D")}
                    </span>

                    <span class="stock-variation">
                        ${variation >= 0 ? "+" : ""}
                        ${formatPercent(variation)}
                    </span>

                </div>

                <div class="stock-reason">

                    <strong>
                        O que aconteceu:
                    </strong>

                    ${escapeHTML(
                        stock.event ||
                        "Informação sobre o movimento ainda não disponível."
                    )}

                </div>

                <div class="stock-reason">

                    <strong>
                        Por que o mercado reagiu:
                    </strong>

                    ${escapeHTML(
                        stock.reason ||
                        "Motivo ainda não confirmado."
                    )}

                </div>

                <div class="stock-source">

                    Fonte:
                    ${escapeHTML(
                        stock.source ||
                        "Fonte não informada"
                    )}

                </div>

            </article>
        `;
    }


    if (upContainer) {

        if (!rising.length) {

            showUnavailable(
                upContainer,
                "Não há ações em alta com dados verificados disponíveis no momento."
            );

        } else {

            upContainer.innerHTML =
                rising
                    .slice(0, 10)
                    .map(createStockCard)
                    .join("");
        }
    }


    if (downContainer) {

        if (!falling.length) {

            showUnavailable(
                downContainer,
                "Não há ações em baixa com dados verificados disponíveis no momento."
            );

        } else {

            downContainer.innerHTML =
                falling
                    .slice(0, 10)
                    .map(createStockCard)
                    .join("");
        }
    }
}


document.addEventListener(
    "economic-data-updated",
    (event) => {

        if (event.detail.module !== "stocks") {
            return;
        }

        renderStocks(
            event.detail.data
        );
    }
);


/* =========================================================
   14. RENDERIZAÇÃO DE NOTÍCIAS
   ========================================================= */

function renderNews(data) {

    const container =
        $("[data-news-container]");

    if (!container) return;

    if (!Array.isArray(data) || !data.length) {

        showUnavailable(
            container,
            "Nenhuma notícia verificada disponível no momento."
        );

        return;
    }

    container.innerHTML = data.map((article) => {

        const imageHTML =
            article.image
                ? `
                    <img
                        src="${escapeHTML(article.image)}"
                        alt="${escapeHTML(article.imageAlt || article.title)}"
                        loading="lazy"
                    >
                `
                : `
                    <div class="news-image-placeholder">
                        IMAGEM NÃO DISPONÍVEL
                    </div>
                `;

        const sourceLink =
            article.url
                ? `
                    <a
                        class="news-link"
                        href="${escapeHTML(article.url)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Ler matéria oficial
                    </a>
                `
                : "";

        return `
            <article class="news-card">

                <div class="news-image">
                    ${imageHTML}
                </div>

                <div class="news-body">

                    <span class="news-category">
                        ${escapeHTML(article.category || "Economia")}
                    </span>

                    <h3 class="news-title">
                        ${escapeHTML(article.title)}
                    </h3>

                    <p class="news-summary">
                        ${escapeHTML(article.summary || "")}
                    </p>

                    <div class="news-meta">

                        <span>
                            Fonte:
                            ${escapeHTML(article.source || "N/D")}
                        </span>

                        <span>
                            ${escapeHTML(
                                article.updatedAt
                                    ? formatDateTime(article.updatedAt)
                                    : "Data não disponível"
                            )}
                        </span>

                    </div>

                    ${sourceLink}

                </div>

            </article>
        `;

    }).join("");
}


document.addEventListener(
    "economic-data-updated",
    (event) => {

        if (event.detail.module !== "news") {
            return;
        }

        renderNews(
            event.detail.data
        );
    }
);


/* =========================================================
   15. GRÁFICOS
   ========================================================= */

function initializeCharts() {

    /*
     * Os gráficos serão criados quando dados reais forem
     * recebidos.
     *
     * Não criar gráfico com números fictícios apresentados
     * como atuais.
     */

    if (typeof Chart === "undefined") {
        return;
    }

    $$("[data-chart]").forEach((canvas) => {

        const context =
            canvas.getContext("2d");

        if (!context) return;

        /*
         * O gráfico permanece preparado para receber dados.
         * A implementação específica será alimentada pelo
         * módulo correspondente.
         */
    });
}

initializeCharts();


/* =========================================================
   16. OBSERVADOR DE ELEMENTOS
   ========================================================= */

function initializeLazyObserver() {

    if (!("IntersectionObserver" in window)) {
        return;
    }

    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add(
                        "is-visible"
                    );

                    observer.unobserve(
                        entry.target
                    );
                });

            },
            {
                threshold: 0.08
            }
        );

    $$("[data-reveal]").forEach((element) => {
        observer.observe(element);
    });
}

initializeLazyObserver();


/* =========================================================
   17. ERROS GLOBAIS
   ========================================================= */

window.addEventListener(
    "error",
    (event) => {

        console.error(
            "Erro no site:",
            event.error || event.message
        );
    }
);


/* =========================================================
   18. INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document.documentElement.classList.add(
            "js-enabled"
        );

        console.log(
            "Economia Sem Complicação iniciado."
        );
    }
);
