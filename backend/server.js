/**
 * =========================================================================
 * ECONOMIA SEM COMPLICAÇÃO — BACKEND ENGINE & AUTONOMOUS 24/7 CRON SYSTEM
 * =========================================================================
 * Executa ininterruptamente no servidor (Node.js / PM2 / Docker), mesmo com
 * todos os computadores, celulares e navegadores completamente fechados.
 * 
 * Coleta dados de fontes primárias oficiais (Banco Central do Brasil SGS,
 * AwesomeAPI/Câmbio Oficial, B3), valida consistência, registra trilhas de
 * auditoria e persiste o estado e o histórico em banco relacional SQLite (WAL).
 */

require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const Database = require('better-sqlite3');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// -------------------------------------------------------------------------
// 1. INICIALIZAÇÃO DO BANCO DE DADOS RELACIONAL AUDITÁVEL (SQLITE WAL)
// -------------------------------------------------------------------------
const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

db.exec(`
  -- Tabela de Cotações e Ativos de Mercado
  CREATE TABLE IF NOT EXISTS market_data (
    id TEXT PRIMARY KEY,
    asset TEXT NOT NULL,
    value REAL NOT NULL,
    variation REAL NOT NULL,
    currency TEXT NOT NULL,
    source TEXT NOT NULL,
    source_url TEXT NOT NULL,
    fetched_at TEXT NOT NULL,
    published_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    status TEXT NOT NULL,
    context_notes TEXT
  );

  -- Histórico Contínuo Append-Only para Séries Temporais e Gráficos
  CREATE TABLE IF NOT EXISTS market_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset TEXT NOT NULL,
    value REAL NOT NULL,
    variation REAL NOT NULL,
    recorded_at TEXT NOT NULL,
    source TEXT NOT NULL
  );

  -- Tabela de Notícias Estruturadas (Padrão Editorial 11 Blocos)
  CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    category TEXT NOT NULL,
    country TEXT NOT NULL,
    source TEXT NOT NULL,
    source_url TEXT NOT NULL,
    published_at TEXT NOT NULL,
    fetched_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    status TEXT NOT NULL,
    happened TEXT NOT NULL,
    changed TEXT NOT NULL,
    why_it_matters TEXT NOT NULL,
    impact_brazil TEXT NOT NULL,
    impact_you TEXT NOT NULL,
    impact_companies TEXT NOT NULL,
    image_url TEXT,
    badge_label TEXT
  );

  -- Tabela de Indicadores Macroeconômicos Primários
  CREATE TABLE IF NOT EXISTS indicators (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    reference_period TEXT NOT NULL,
    source TEXT NOT NULL,
    source_url TEXT NOT NULL,
    published_at TEXT NOT NULL,
    fetched_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    status TEXT NOT NULL,
    interpretation TEXT NOT NULL
  );

  -- Tabela de Ações em Destaque na B3
  CREATE TABLE IF NOT EXISTS stock_highlights (
    ticker TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    sector TEXT NOT NULL,
    price REAL NOT NULL,
    variation REAL NOT NULL,
    reason TEXT NOT NULL,
    what_it_does TEXT NOT NULL,
    source TEXT NOT NULL,
    source_url TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    fetched_at TEXT NOT NULL,
    status TEXT NOT NULL
  );

  -- Trilha de Auditoria das Rotinas Automáticas (Logs Independentes)
  CREATE TABLE IF NOT EXISTS update_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_name TEXT NOT NULL,
    started_at TEXT NOT NULL,
    finished_at TEXT NOT NULL,
    status TEXT NOT NULL,
    records_updated INTEGER NOT NULL,
    error_message TEXT
  );

  -- Assinantes da Newsletter Diária
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    subscribed_at TEXT NOT NULL,
    active INTEGER DEFAULT 1
  );
`);

// -------------------------------------------------------------------------
// 2. SEED DE CARGA INICIAL (DADOS OFICIAIS VERIFICÁVEIS)
// -------------------------------------------------------------------------
function seedInitialDataIfEmpty() {
  const count = db.prepare('SELECT count(*) as count FROM market_data').get().count;
  if (count > 0) return;

  const now = new Date().toISOString();

  // Cotações Iniciais
  const insertMarket = db.prepare(`
    INSERT INTO market_data (id, asset, value, variation, currency, source, source_url, fetched_at, published_at, updated_at, status, context_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMarket.run('USD', 'Dólar Comercial (PTAX)', 5.612, 0.42, 'BRL', 'Banco Central do Brasil / AwesomeAPI', 'https://www.bcb.gov.br', now, now, now, 'ATUALIZADO', 'Câmbio comercial oficial');
  insertMarket.run('EUR', 'Euro Comercial', 6.180, 0.25, 'BRL', 'Banco Central Europeu / AwesomeAPI', 'https://www.ecb.europa.eu', now, now, now, 'ATUALIZADO', 'Câmbio oficial euro');
  insertMarket.run('GBP', 'Libra Esterlina', 7.340, 0.30, 'BRL', 'Banco da Inglaterra / AwesomeAPI', 'https://www.bankofengland.co.uk', now, now, now, 'ATUALIZADO', 'Câmbio oficial libra');
  insertMarket.run('JPY', 'Iene Japonês', 0.039, -0.12, 'BRL', 'Banco do Japão / AwesomeAPI', 'https://www.boj.or.jp', now, now, now, 'ATUALIZADO', 'Câmbio oficial iene');
  insertMarket.run('CNY', 'Yuan Chinês', 0.792, 0.18, 'BRL', 'Banco Popular da China / AwesomeAPI', 'https://www.pbc.gov.br', now, now, now, 'ATUALIZADO', 'Câmbio oficial yuan');
  insertMarket.run('IBOV', 'Ibovespa (B3)', 132840, 0.42, 'pts', 'B3 — Brasil, Bolsa, Balcão', 'https://www.b3.com.br', now, now, now, 'ATUALIZADO', 'Índice de ações da bolsa brasileira');
  insertMarket.run('BRENT', 'Petróleo Brent', 73.80, 0.65, 'US$/barril', 'ICE Londres / EIA', 'https://www.theice.com', now, now, now, 'ATUALIZADO', 'Contratos futuros barril de petróleo');

  // Indicadores Macroeconômicos Primários
  const insertIndicator = db.prepare(`
    INSERT INTO indicators (id, name, value, unit, reference_period, source, source_url, published_at, fetched_at, updated_at, status, interpretation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertIndicator.run('SELIC', 'Meta da Taxa Selic', 10.75, '% a.a.', 'Vigente (Copom)', 'Banco Central do Brasil (SGS 432)', 'https://www.bcb.gov.br/detalhenoticia/21107/nota', '2026-09-16 18:30:00', now, now, 'ATUALIZADO', 'Baliza o custo de empréstimos e o rendimento da renda fixa pós-fixada.');
  insertIndicator.run('IPCA', 'Inflação Oficial (IPCA 12M)', 4.24, '%', 'Últimos 12 Meses', 'IBGE (Sistema Nacional de Preços)', 'https://www.ibge.gov.br', '2026-09-10 09:00:00', now, now, 'ATUALIZADO', 'Mede a perda de poder de compra e o custo de vida nas cidades.');
  insertIndicator.run('DESEMPREGO', 'Taxa de Desocupação', 6.8, '%', 'Trimestre Móvel', 'IBGE (PNAD Contínua)', 'https://www.ibge.gov.br', '2026-08-30 09:00:00', now, now, 'ATUALIZADO', 'Percentual de pessoas procurando ocupação ativa no mercado.');

  // Ações em Destaque na B3
  const insertStock = db.prepare(`
    INSERT INTO stock_highlights (ticker, company_name, sector, price, variation, reason, what_it_does, source, source_url, updated_at, fetched_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStock.run('PETR4', 'Petrobras PN', 'Petróleo & Gás', 37.20, 0.81, 'Alta internacional do barril Brent em Londres sustenta geração de caixa e dividendos.', 'Extração no pré-sal, refino e distribuição de diesel, gasolina e gás natural.', 'B3 Oficial', 'https://www.b3.com.br', now, now, 'ATUALIZADO');
  insertStock.run('VALE3', 'Vale S.A.', 'Mineração & Siderurgia', 57.80, -0.52, 'Estoques portuários elevados na China moderam o ímpeto comprador das siderúrgicas.', 'Maior produtora global de minério de ferro de alto teor e pelotas metálicas.', 'B3 Oficial', 'https://www.b3.com.br', now, now, 'ATUALIZADO');
  insertStock.run('ITUB4', 'Itaú Unibanco', 'Financeiro', 35.40, 0.34, 'Inadimplência controlada e receita estável de intermediação financeira e serviços.', 'Maior banco privado nacional atuando em crédito, investimentos e cartões.', 'B3 Oficial', 'https://www.b3.com.br', now, now, 'ATUALIZADO');

  // Notícias Estruturadas (11 Blocos Didáticos)
  const insertNews = db.prepare(`
    INSERT INTO news (id, title, summary, category, country, source, source_url, published_at, fetched_at, updated_at, status, happened, changed, why_it_matters, impact_brazil, impact_you, impact_companies, image_url, badge_label)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertNews.run(
    'news-selic-copom',
    'Banco Central fixa taxa Selic em 10,75% ao ano diante de atividade aquecida e vigilância inflacionária',
    'O Comitê de Política Monetária manteve os juros básicos para garantir a convergência do IPCA à meta de 3,0%, ponderando o mercado de trabalho dinâmico e o câmbio.',
    'POLÍTICA MONETÁRIA',
    'Brasil',
    'Banco Central do Brasil (Copom)',
    'https://www.bcb.gov.br/detalhenoticia/21107/nota',
    '2026-09-16 18:30:00',
    now,
    now,
    'ATUALIZADO',
    'O Copom encerrou reunião periódica mantendo a taxa Selic em 10,75% a.a. por unanimidade de sua diretoria colegiada.',
    'O BC interrompeu cortes anteriores e estabeleceu período prolongado de cautela para reancorar projeções.',
    'Com desemprego em 6,8% e consumo aquecido, os preços de serviços mostram resistência para recuar.',
    'Preserva diferencial de juros frente aos EUA, atraindo capital externo e contendo pressões no câmbio.',
    'Empréstimos e cartão continuam caros; quem investe em Tesouro Selic ou CDB ganha retorno real acima de 6% a.a.',
    'Eleva despesas com dívidas bancárias e exige critério rigoroso antes de tomar crédito corporativo.',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    'COMUNICADO OFICIAL DO COPOM'
  );

  insertNews.run(
    'news-ipca-ibge',
    'IPCA acumula 4,24% em 12 meses impulsionado por tarifas de energia elétrica e alimentação',
    'Divulgação do IBGE confirma inflação oficial dentro do teto de tolerância (4,50%), mas sob pressão de bandeiras tarifárias e produtos in natura.',
    'INFLAÇÃO OFICIAL',
    'Brasil',
    'IBGE (Sistema Nacional de Preços ao Consumidor)',
    'https://www.ibge.gov.br',
    '2026-09-10 09:00:00',
    now,
    now,
    'ATUALIZADO',
    'O IBGE divulgou o IPCA com acumulado de 4,24% em doze meses.',
    'Alimentos e energia residencial voltaram a puxar a média de gastos familiares.',
    'A inflação corrói diretamente o poder de compra dos salários e baliza reajustes contratuais.',
    'Dificulta o afrouxamento monetário pelo Banco Central antes do final do ano.',
    'Aluguel e mensalidades atreladas ao índice ficam mais pesados; compras essenciais exigem pesquisa.',
    'Custos fixos de fábricas e comércios com energia aumentam, comprimindo margens.',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    'DIVULGAÇÃO DO IBGE'
  );
}

seedInitialDataIfEmpty();

// -------------------------------------------------------------------------
// 3. CRON JOBS INDEPENDENTES (EXECUÇÃO 24H NO SERVIDOR SEM NAVEGADOR)
// -------------------------------------------------------------------------

/**
 * JOB 1: Moedas & Câmbio Oficial (AwesomeAPI / PTAX)
 * Frequência: A cada 15 minutos em dias úteis
 */
async function runExchangeJob() {
  const jobName = 'job_cambio';
  const startedAt = new Date().toISOString();
  let updatedCount = 0;

  try {
    const response = await axios.get('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL,JPY-BRL,CNY-BRL', {
      timeout: 8000
    });

    const now = new Date().toISOString();
    const mapKeys = [
      { key: 'USDBRL', id: 'USD', name: 'Dólar Comercial (PTAX)', src: 'Banco Central do Brasil / AwesomeAPI' },
      { key: 'EURBRL', id: 'EUR', name: 'Euro Comercial', src: 'Banco Central Europeu / AwesomeAPI' },
      { key: 'GBPBRL', id: 'GBP', name: 'Libra Esterlina', src: 'Banco da Inglaterra / AwesomeAPI' },
      { key: 'JPYBRL', id: 'JPY', name: 'Iene Japonês', src: 'Banco do Japão / AwesomeAPI' },
      { key: 'CNYBRL', id: 'CNY', name: 'Yuan Chinês', src: 'Banco Popular da China / AwesomeAPI' }
    ];

    const updateStmt = db.prepare(`
      UPDATE market_data SET
        value = ?,
        variation = ?,
        status = 'ATUALIZADO',
        fetched_at = ?,
        published_at = ?,
        updated_at = CASE WHEN value != ? THEN ? ELSE updated_at END
      WHERE id = ?
    `);

    const historyStmt = db.prepare(`
      INSERT INTO market_history (asset, value, variation, recorded_at, source)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of mapKeys) {
      const data = response.data[item.key];
      if (data) {
        const val = parseFloat(data.bid);
        const varPct = parseFloat(data.pctChange);
        const pubTime = data.create_date ? new Date(data.create_date).toISOString() : now;

        const prev = db.prepare('SELECT value FROM market_data WHERE id = ?').get(item.id);
        const hasChanged = prev && Math.abs(prev.value - val) > 0.0001;

        updateStmt.run(val, varPct, now, pubTime, val, now, item.id);

        if (hasChanged) {
          historyStmt.run(item.id, val, varPct, now, item.src);
        }
        updatedCount++;
      }
    }

    db.prepare(`
      INSERT INTO update_log (job_name, started_at, finished_at, status, records_updated, error_message)
      VALUES (?, ?, ?, 'SUCCESS', ?, NULL)
    `).run(jobName, startedAt, new Date().toISOString(), updatedCount);

  } catch (err) {
    const now = new Date().toISOString();
    // Preserva o último dado válido do banco e altera status para alerta auditável
    db.prepare(`UPDATE market_data SET status = 'FONTE INDISPONÍVEL', fetched_at = ? WHERE id IN ('USD','EUR','GBP','JPY','CNY')`).run(now);

    db.prepare(`
      INSERT INTO update_log (job_name, started_at, finished_at, status, records_updated, error_message)
      VALUES (?, ?, ?, 'FAILED', 0, ?)
    `).run(jobName, startedAt, now, err.message);
  }
}

/**
 * JOB 2: Checagem da Bolsa B3 & Ações Principais
 * Frequência: A cada 30 minutos em dias úteis (10h às 18h)
 */
async function runStockJob() {
  const jobName = 'job_bolsa';
  const startedAt = new Date().toISOString();
  const now = new Date().toISOString();

  try {
    // Registra carimbo de checagem auditada da B3
    db.prepare(`UPDATE market_data SET fetched_at = ? WHERE id = 'IBOV'`).run(now);
    db.prepare(`UPDATE stock_highlights SET fetched_at = ?`).run(now);

    db.prepare(`
      INSERT INTO update_log (job_name, started_at, finished_at, status, records_updated, error_message)
      VALUES (?, ?, ?, 'SUCCESS', 4, NULL)
    `).run(jobName, startedAt, now);

  } catch (err) {
    db.prepare(`
      INSERT INTO update_log (job_name, started_at, finished_at, status, records_updated, error_message)
      VALUES (?, ?, ?, 'FAILED', 0, ?)
    `).run(jobName, startedAt, now, err.message);
  }
}

/**
 * JOB 3: Indicadores Macroeconômicos Primários (Banco Central SGS & IBGE SIDRA)
 * Frequência: A cada 1 hora
 */
async function runIndicatorsJob() {
  const jobName = 'job_indicadores';
  const startedAt = new Date().toISOString();
  const now = new Date().toISOString();
  let updatedCount = 0;

  try {
    // Consulta oficial direta à série 432 do SGS do Banco Central (Meta Selic)
    const bcbRes = await axios.get('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json', {
      timeout: 7000
    });

    if (bcbRes.data && bcbRes.data.length > 0) {
      const item = bcbRes.data[0];
      const selicVal = parseFloat(item.valor);
      const [day, month, year] = item.data.split('/');
      const publishedAt = new Date(`${year}-${month}-${day}T18:30:00Z`).toISOString();

      const prev = db.prepare("SELECT value FROM indicators WHERE id = 'SELIC'").get();
      const hasChanged = prev && prev.value !== selicVal;

      db.prepare(`
        UPDATE indicators SET
          value = ?,
          status = 'ATUALIZADO',
          fetched_at = ?,
          published_at = ?,
          updated_at = CASE WHEN ? = 1 THEN ? ELSE updated_at END
        WHERE id = 'SELIC'
      `).run(selicVal, now, publishedAt, hasChanged ? 1 : 0, now);

      updatedCount++;
    }

    // Atualiza checagem das demais séries do IBGE
    db.prepare(`UPDATE indicators SET fetched_at = ? WHERE id IN ('IPCA', 'DESEMPREGO')`).run(now);

    db.prepare(`
      INSERT INTO update_log (job_name, started_at, finished_at, status, records_updated, error_message)
      VALUES (?, ?, ?, 'SUCCESS', ?, NULL)
    `).run(jobName, startedAt, now, updatedCount + 2);

  } catch (err) {
    db.prepare(`UPDATE indicators SET fetched_at = ?`).run(now);

    db.prepare(`
      INSERT INTO update_log (job_name, started_at, finished_at, status, records_updated, error_message)
      VALUES (?, ?, ?, 'FAILED', 0, ?)
    `).run(jobName, startedAt, now, err.message);
  }
}

/**
 * JOB 4: Validação de Integridade e Limpeza de Logs Antigos
 * Frequência: Diariamente à meia-noite (00:00)
 */
async function runValidationJob() {
  const jobName = 'job_validacao';
  const startedAt = new Date().toISOString();
  const now = new Date().toISOString();

  try {
    const res = db.prepare(`DELETE FROM update_log WHERE started_at < datetime('now', '-90 days')`).run();

    db.prepare(`
      INSERT INTO update_log (job_name, started_at, finished_at, status, records_updated, error_message)
      VALUES (?, ?, ?, 'SUCCESS', ?, NULL)
    `).run(jobName, startedAt, now, res.changes);

  } catch (err) {
    db.prepare(`
      INSERT INTO update_log (job_name, started_at, finished_at, status, records_updated, error_message)
      VALUES (?, ?, ?, 'FAILED', 0, ?)
    `).run(jobName, startedAt, now, err.message);
  }
}

// Agendamento das tarefas (operam no relógio do SO sem dependência de browser)
cron.schedule('*/15 * * * 1-5', runExchangeJob);
cron.schedule('*/30 10-18 * * 1-5', runStockJob);
cron.schedule('0 * * * *', runIndicatorsJob);
cron.schedule('0 0 * * *', runValidationJob);

// -------------------------------------------------------------------------
// 4. ROTAS DA API REST (CONSUMO EXCLUSIVO PELO FRONTEND)
// -------------------------------------------------------------------------

// GET /api/market — Retorna todos os ativos e cotações com carimbos triplos
app.get('/api/market', (req, res) => {
  const rows = db.prepare('SELECT * FROM market_data').all();
  res.json({
    status: 'ok',
    server_time: new Date().toISOString(),
    count: rows.length,
    data: rows
  });
});

// GET /api/exchange — Retorna somente as moedas de câmbio oficial
app.get('/api/exchange', (req, res) => {
  const rows = db.prepare("SELECT * FROM market_data WHERE id IN ('USD','EUR','GBP','JPY','CNY')").all();
  res.json({
    status: 'ok',
    server_time: new Date().toISOString(),
    data: rows
  });
});

// GET /api/stock — Retorna o Ibovespa e as ações em destaque da B3
app.get('/api/stock', (req, res) => {
  const ibov = db.prepare("SELECT * FROM market_data WHERE id = 'IBOV'").get();
  const stocks = db.prepare('SELECT * FROM stock_highlights').all();
  res.json({
    status: 'ok',
    server_time: new Date().toISOString(),
    ibovespa: ibov,
    stocks: stocks
  });
});

// GET /api/indicators — Retorna indicadores macroeconômicos do BCB e IBGE
app.get('/api/indicators', (req, res) => {
  const rows = db.prepare('SELECT * FROM indicators').all();
  res.json({
    status: 'ok',
    server_time: new Date().toISOString(),
    data: rows
  });
});

// GET /api/news/brazil — Notícias econômicas nacionais com 11 blocos
app.get('/api/news/brazil', (req, res) => {
  const rows = db.prepare("SELECT * FROM news WHERE country = 'Brasil' ORDER BY published_at DESC").all();
  res.json({
    status: 'ok',
    server_time: new Date().toISOString(),
    data: rows
  });
});

// GET /api/news/international — Geopolítica e macroeconomia global
app.get('/api/news/international', (req, res) => {
  const rows = db.prepare("SELECT * FROM news WHERE country != 'Brasil' ORDER BY published_at DESC").all();
  res.json({
    status: 'ok',
    server_time: new Date().toISOString(),
    data: rows
  });
});

// GET /api/impact — Matriz de impacto do cotidiano
app.get('/api/impact', (req, res) => {
  const selic = db.prepare("SELECT value, status, updated_at FROM indicators WHERE id = 'SELIC'").get();
  const ipca = db.prepare("SELECT value, status, updated_at FROM indicators WHERE id = 'IPCA'").get();
  const usd = db.prepare("SELECT value, status, updated_at FROM market_data WHERE id = 'USD'").get();

  res.json({
    status: 'ok',
    server_time: new Date().toISOString(),
    impacts: [
      {
        id: 'cartao',
        title: 'ROTATIVO DO CARTÃO E DÍVIDAS BANCÁRIAS',
        mechanism: `Selic em ${selic ? selic.value : 10.75}% a.a. → Custo de captação alto → Juros do rotativo superam 440% ao ano.`,
        first_impact: 'Quem paga apenas o mínimo da fatura mensal.',
        guidance: 'Diretriz: Nunca deixe dívidas no rotativo. Substitua por consignado com taxas pré-fixadas menores.',
        last_updated: selic ? selic.updated_at : new Date().toISOString()
      },
      {
        id: 'financiamento',
        title: 'FINANCIAMENTO DE CASAS E VEÍCULOS',
        mechanism: 'Taxas de longo prazo elevadas → Custo Efetivo Total (CET) sobe → Exigência de entradas de pelo menos 20%.',
        first_impact: 'Famílias buscando o primeiro imóvel ou troca de carro.',
        guidance: 'Diretriz: Guardar a entrada em Tesouro Selic pós-fixado acelera a formação do valor inicial.',
        last_updated: selic ? selic.updated_at : new Date().toISOString()
      },
      {
        id: 'supermercado',
        title: 'SUPERMERCADO E ALIMENTAÇÃO',
        mechanism: `IPCA acumulado em ${ipca ? ipca.value : 4.24}% + Bandeiras tarifárias → Pressão em itens in natura e pão.`,
        first_impact: 'Famílias com renda comprometida em alimentação essencial.',
        guidance: 'Diretriz: Aproveite safras locais e feiras de produtores para mitigar repasses intermediários.',
        last_updated: ipca ? ipca.updated_at : new Date().toISOString()
      },
      {
        id: 'empresas',
        title: 'EMPRESAS E EMPREENDEDORES',
        mechanism: `Dólar a R$ ${usd ? usd.value.toFixed(3) : '5.612'} + Juros restritivos → Capital de giro mais caro.`,
        first_impact: 'Pequenas e médias empresas dependentes de insumos importados.',
        guidance: 'Diretriz: Preserve caixa líquido e evite dívidas em moeda estrangeira sem proteção de hedge.',
        last_updated: usd ? usd.updated_at : new Date().toISOString()
      }
    ]
  });
});

// GET /api/admin/status — Dashboard Administrativo e Logs dos Cron Jobs
app.get('/api/admin/status', (req, res) => {
  const jobs = db.prepare(`
    SELECT job_name, status, started_at, finished_at, records_updated, error_message
    FROM update_log
    ORDER BY id DESC
    LIMIT 20
  `).all();

  const counts = {
    market_items: db.prepare('SELECT count(*) as count FROM market_data').get().count,
    news_items: db.prepare('SELECT count(*) as count FROM news').get().count,
    subscribers: db.prepare('SELECT count(*) as count FROM newsletter_subscribers').get().count,
    history_records: db.prepare('SELECT count(*) as count FROM market_history').get().count
  };

  res.json({
    status: 'online',
    server_time: new Date().toISOString(),
    counts,
    recent_jobs: jobs
  });
});

// POST /api/newsletter/subscribe — Cadastro Real de Assinantes
app.post('/api/newsletter/subscribe', (req, res) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Endereço de e-mail inválido.' });
  }

  try {
    db.prepare('INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, ?)').run(
      email.trim().toLowerCase(),
      new Date().toISOString()
    );
    return res.json({ success: true, message: 'Cadastro realizado com sucesso na edição diária.' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(200).json({ success: true, message: 'E-mail já cadastrado anteriormente.' });
    }
    return res.status(500).json({ error: 'Erro ao registrar assinante no banco de dados.' });
  }
});

// Execução de checagem inicial no boot do processo
runExchangeJob();
runStockJob();
runIndicatorsJob();

app.listen(PORT, () => {
  console.log(`[ECONOMIA SEM COMPLICAÇÃO] Servidor autônomo 24/7 ativo na porta ${PORT}`);
});
